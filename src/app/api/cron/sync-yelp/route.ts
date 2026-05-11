import { NextRequest } from 'next/server';
import { syncAllYelpPlatforms } from '@/services/yelpReviewService';
import { successResponse, errorResponse } from '@/lib/api';
import { verifyCronAuth } from '@/lib/cronAuth';
import { captureError } from '@/lib/observability';

export async function GET(request: NextRequest) {
  const authGuard = verifyCronAuth(request);
  if (authGuard) return authGuard;

  try {
    const result = await syncAllYelpPlatforms();
    console.log(
      `[cron:sync-yelp] ${result.synced} reviews from ${result.total} platforms` +
        (result.errors.length ? ` (${result.errors.length} errors)` : ''),
    );
    if (result.errors.length > 0) {
      captureError(new Error('Partial Yelp sync failure'), {
        tag: 'cron:sync-yelp',
        extra: { errors: result.errors, synced: result.synced, total: result.total },
      });
    }
    return successResponse(result);
  } catch (error) {
    captureError(error, { tag: 'cron:sync-yelp' });
    return errorResponse('Sync failed', 500);
  }
}
