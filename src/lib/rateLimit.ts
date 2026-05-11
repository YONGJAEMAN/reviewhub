import { NextResponse } from 'next/server';

/**
 * Rate limiter with pluggable backend.
 *
 * Default backend: in-memory sliding window (per-instance, OK for abuse
 * prevention but NOT a strict global quota on multi-instance serverless).
 *
 * When `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set, the
 * async API (`checkRateLimitAsync` / `rateLimitOrResponseAsync`) routes
 * through Upstash Redis for strict cross-instance counts. The sync API
 * always uses in-memory.
 *
 * Backends use the same sliding-window semantics: a key holds timestamps of
 * recent hits; entries older than `windowMs` are dropped on each check.
 */

// ─── Types ─────────────────────────────────────────────

export interface RateLimitOptions {
  /** Unique bucket id, e.g. "waitlist" */
  name: string;
  /** Window in milliseconds */
  windowMs: number;
  /** Max requests allowed in the window */
  max: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

interface RateLimitBackend {
  check(key: string, opts: RateLimitOptions): Promise<RateLimitResult>;
}

// ─── In-memory sliding window ──────────────────────────

type Bucket = { timestamps: number[] };
const buckets = new Map<string, Bucket>();

let lastSweep = 0;
function sweep(now: number, maxWindowMs: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    const cutoff = now - maxWindowMs;
    bucket.timestamps = bucket.timestamps.filter((t) => t >= cutoff);
    if (bucket.timestamps.length === 0) buckets.delete(key);
  }
}

function checkInMemory(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  sweep(now, opts.windowMs);

  const bucket = buckets.get(key) ?? { timestamps: [] };
  const cutoff = now - opts.windowMs;
  bucket.timestamps = bucket.timestamps.filter((t) => t >= cutoff);

  if (bucket.timestamps.length >= opts.max) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSec = Math.max(
      1,
      Math.ceil((oldest + opts.windowMs - now) / 1000),
    );
    buckets.set(key, bucket);
    return { ok: false, remaining: 0, retryAfterSec };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return {
    ok: true,
    remaining: opts.max - bucket.timestamps.length,
    retryAfterSec: 0,
  };
}

const inMemoryBackend: RateLimitBackend = {
  check: async (key, opts) => checkInMemory(key, opts),
};

// ─── Upstash Redis backend ─────────────────────────────
// Uses the @upstash/redis REST API directly via fetch — no SDK needed.
// Sorted-set per key holds timestamps; ZREMRANGEBYSCORE prunes old, ZCARD
// counts current, ZADD records the hit, EXPIRE bounds key lifetime.

class UpstashBackend implements RateLimitBackend {
  constructor(
    private readonly url: string,
    private readonly token: string,
  ) {}

  private async pipeline(commands: Array<string | number>[]): Promise<unknown[]> {
    const res = await fetch(`${this.url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commands),
    });
    if (!res.ok) throw new Error(`Upstash error: ${res.status}`);
    const json = (await res.json()) as Array<{ result: unknown; error?: string }>;
    return json.map((r) => {
      if (r.error) throw new Error(`Upstash command error: ${r.error}`);
      return r.result;
    });
  }

  async check(key: string, opts: RateLimitOptions): Promise<RateLimitResult> {
    const now = Date.now();
    const cutoff = now - opts.windowMs;
    const member = `${now}:${Math.random().toString(36).slice(2, 8)}`;
    const ttlSec = Math.ceil(opts.windowMs / 1000) + 5;

    const results = await this.pipeline([
      ['ZREMRANGEBYSCORE', key, '-inf', String(cutoff)],
      ['ZCARD', key],
      ['ZADD', key, String(now), member],
      ['EXPIRE', key, String(ttlSec)],
    ]);
    const countBefore = (results[1] as number) ?? 0;

    if (countBefore >= opts.max) {
      // We added a member that pushes us over — remove it so we don't pollute
      // the window. Concurrent retries are still safe.
      void this.pipeline([['ZREM', key, member]]).catch(() => {});
      // Find oldest entry to estimate retry-after.
      const oldestRes = await this.pipeline([
        ['ZRANGE', key, '0', '0', 'WITHSCORES'],
      ]);
      const arr = oldestRes[0] as string[] | undefined;
      const oldestTs = arr && arr.length >= 2 ? Number(arr[1]) : now;
      const retryAfterSec = Math.max(
        1,
        Math.ceil((oldestTs + opts.windowMs - now) / 1000),
      );
      return { ok: false, remaining: 0, retryAfterSec };
    }

    return {
      ok: true,
      remaining: Math.max(0, opts.max - (countBefore + 1)),
      retryAfterSec: 0,
    };
  }
}

let _asyncBackend: RateLimitBackend | null = null;
function asyncBackend(): RateLimitBackend {
  if (_asyncBackend) return _asyncBackend;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    _asyncBackend = new UpstashBackend(url, token);
  } else {
    _asyncBackend = inMemoryBackend;
  }
  return _asyncBackend;
}

// Exposed for tests.
export function _resetRateLimitBackend(): void {
  _asyncBackend = null;
  buckets.clear();
  lastSweep = 0;
}

// ─── Public API ────────────────────────────────────────

export function getClientId(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

/** Synchronous, in-memory only. Use for hot paths where one round-trip matters. */
export function checkRateLimit(
  req: Request,
  opts: RateLimitOptions,
): RateLimitResult {
  return checkInMemory(`${opts.name}:${getClientId(req)}`, opts);
}

/** Async, backed by Upstash if configured, else in-memory. */
export async function checkRateLimitAsync(
  req: Request,
  opts: RateLimitOptions,
): Promise<RateLimitResult> {
  return asyncBackend().check(`${opts.name}:${getClientId(req)}`, opts);
}

export function rateLimitOrResponse(
  req: Request,
  opts: RateLimitOptions,
): NextResponse | null {
  const res = checkRateLimit(req, opts);
  if (res.ok) return null;
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(res.retryAfterSec),
        'X-RateLimit-Remaining': '0',
      },
    },
  );
}

export async function rateLimitOrResponseAsync(
  req: Request,
  opts: RateLimitOptions,
): Promise<NextResponse | null> {
  const res = await checkRateLimitAsync(req, opts);
  if (res.ok) return null;
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(res.retryAfterSec),
        'X-RateLimit-Remaining': '0',
      },
    },
  );
}
