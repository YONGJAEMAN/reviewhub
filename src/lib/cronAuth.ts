import { timingSafeEqual } from 'node:crypto';
import { errorResponse } from '@/lib/api';
import type { NextResponse } from 'next/server';
import { requireEnv } from '@/lib/env';

/**
 * Verify a Vercel Cron (or manual) request via `Authorization: Bearer <CRON_SECRET>`.
 *
 * - Hard-fails if CRON_SECRET is not configured (avoids silently accepting
 *   any caller with header `Bearer undefined`).
 * - Uses a constant-time comparison to avoid timing attacks.
 */
export function verifyCronAuth(request: Request): NextResponse | null {
  const expected = requireEnv('CRON_SECRET');
  const expectedHeader = `Bearer ${expected}`;
  const provided = request.headers.get('authorization') ?? '';

  // Length mismatch → not equal; also guards timingSafeEqual which requires
  // equal-length buffers.
  if (provided.length !== expectedHeader.length) {
    return errorResponse('Unauthorized', 401);
  }
  const a = Buffer.from(provided);
  const b = Buffer.from(expectedHeader);
  if (!timingSafeEqual(a, b)) return errorResponse('Unauthorized', 401);
  return null;
}
