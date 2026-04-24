import type { NextRequest } from 'next/server';
import { expireStaleTrials } from '@/services/trialService';
import { successResponse, errorResponse } from '@/lib/api';
import { verifyCronAuth } from '@/lib/cronAuth';
import { captureError } from '@/lib/observability';

/**
 * Daily cleanup: TRIALING subscriptions whose trial has ended without a
 * paid conversion get flipped to CANCELED + plan=FREE.
 *
 * Feature limits are already enforced at request time by planLimits.ts, so
 * this is a DB-state correctness pass — not a security boundary.
 *
 * Schedule: `0 3 * * *` (daily at 03:00 UTC) — see vercel.json.
 */
export async function GET(request: NextRequest) {
  const guard = verifyCronAuth(request);
  if (guard) return guard;

  try {
    const result = await expireStaleTrials();
    console.log(
      `[cron:trial-expiry] processed=${result.processed} errors=${result.errors.length}`,
    );
    if (result.errors.length > 0) {
      captureError(new Error('Partial trial-expiry failure'), {
        tag: 'cron:trial-expiry',
        extra: { errors: result.errors, processed: result.processed },
      });
    }
    return successResponse(result);
  } catch (error) {
    captureError(error, { tag: 'cron:trial-expiry' });
    return errorResponse('Trial expiry cron failed', 500);
  }
}
