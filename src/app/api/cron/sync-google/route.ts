import { NextRequest } from 'next/server';
import { syncAllGooglePlatforms } from '@/services/googleReviewService';
import { successResponse, errorResponse } from '@/lib/api';
import { verifyCronAuth } from '@/lib/cronAuth';
import { captureError } from '@/lib/observability';

export async function GET(request: NextRequest) {
  const authGuard = verifyCronAuth(request);
  if (authGuard) return authGuard;

  try {
    const result = await syncAllGooglePlatforms();
    console.log(
      `[cron:sync-google] ${result.synced} reviews from ${result.total} platforms` +
        (result.errors.length ? ` (${result.errors.length} errors)` : ''),
    );
    if (result.errors.length > 0) {
      captureError(new Error('Partial sync failure'), {
        tag: 'cron:sync-google',
        extra: { errors: result.errors, synced: result.synced, total: result.total },
      });
    }
    return successResponse(result);
  } catch (error) {
    captureError(error, { tag: 'cron:sync-google' });
    return errorResponse('Sync failed', 500);
  }
}
