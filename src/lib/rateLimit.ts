import { NextResponse } from 'next/server';

/**
 * Lightweight in-memory rate limiter.
 *
 * NOTE: On serverless platforms (Vercel), each instance holds its own map,
 * so this gives best-effort protection per-instance — NOT a strict global
 * quota. For strict global limits, back this with Upstash/Redis later.
 *
 * Sliding-window-ish: we store timestamps per key and drop entries older
 * than the window on each check.
 */
type Bucket = { timestamps: number[] };
const buckets = new Map<string, Bucket>();

// Periodically prune stale keys to keep memory bounded.
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

/**
 * Extract a caller identity from a request. Prefers forwarded headers used
 * by Vercel/proxies, falling back to a shared bucket for unknown origin.
 */
export function getClientId(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

export function checkRateLimit(
  req: Request,
  opts: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  sweep(now, opts.windowMs);

  const key = `${opts.name}:${getClientId(req)}`;
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

/**
 * Returns a 429 response if the limit is exceeded, or null to continue.
 */
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
