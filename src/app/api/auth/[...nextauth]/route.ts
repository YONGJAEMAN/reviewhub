import { handlers } from '@/lib/auth';
import { checkRateLimit, getClientId } from '@/lib/rateLimit';
import { NextResponse } from 'next/server';

const baseGet = handlers.GET;
const basePost = handlers.POST;

/**
 * Wrap the NextAuth POST handler to rate-limit credentials sign-in attempts
 * BEFORE bcrypt runs. Without this, an attacker can brute force credentials
 * at thousands of attempts per second.
 *
 * Bucketing strategy:
 *   - Per-IP (15 attempts / 15 min)
 *   - Per-email if present in body (10 attempts / 15 min) — protects a
 *     specific account from distributed-IP attacks.
 *
 * Only `credentials` callback URL is gated; OAuth provider callbacks are
 * pass-through (they have their own rate controls upstream).
 */
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const PER_IP_MAX = 15;
const PER_EMAIL_MAX = 10;

async function rateLimitedPost(req: Request): Promise<Response> {
  const url = new URL(req.url);
  // NextAuth credentials sign-in posts to /api/auth/callback/credentials.
  const isCredentialsLogin = url.pathname.endsWith('/callback/credentials');

  if (!isCredentialsLogin) {
    return basePost(req as never);
  }

  // Clone before consuming body — NextAuth needs to read it too.
  const clone = req.clone();
  let email: string | undefined;
  try {
    const ctype = req.headers.get('content-type') ?? '';
    if (ctype.includes('application/x-www-form-urlencoded')) {
      const text = await clone.text();
      const params = new URLSearchParams(text);
      email = params.get('email') ?? undefined;
    } else if (ctype.includes('application/json')) {
      const json = (await clone.json()) as { email?: string };
      email = json.email;
    }
  } catch {
    // Best-effort — fall through to IP-only rate limit.
  }

  const ipRes = checkRateLimit(req, {
    name: 'login:ip',
    windowMs: LOGIN_WINDOW_MS,
    max: PER_IP_MAX,
  });
  if (!ipRes.ok) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(ipRes.retryAfterSec) },
      },
    );
  }

  if (email) {
    // Synthesize a request keyed by email so checkRateLimit's per-IP keying
    // becomes per-email here.
    const emailReq = new Request(req.url, {
      headers: { 'x-forwarded-for': `email:${email.toLowerCase()}` },
    });
    const emailRes = checkRateLimit(emailReq, {
      name: 'login:email',
      windowMs: LOGIN_WINDOW_MS,
      max: PER_EMAIL_MAX,
    });
    if (!emailRes.ok) {
      return NextResponse.json(
        { error: 'Too many attempts on this account. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(emailRes.retryAfterSec) },
        },
      );
    }
  }

  void getClientId; // referenced to keep import meaningful for future logging
  return basePost(req as never);
}

export const GET = baseGet;
export const POST = rateLimitedPost;
