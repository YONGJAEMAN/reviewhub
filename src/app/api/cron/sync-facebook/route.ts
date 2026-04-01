import { NextRequest } from 'next/server';
import { syncAllFacebookPlatforms } from '@/services/facebookReviewService';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return errorResponse('Unauthorized', 401);
    }

    const result = await syncAllFacebookPlatforms();

    console.log(
      `[Cron] Facebook sync: ${result.synced} reviews synced from ${result.total} platforms` +
      (result.errors.length ? ` (${result.errors.length} errors)` : '')
    );

    return successResponse(result);
  } catch (error) {
    console.error('[Cron] Facebook sync failed:', error);
    return errorResponse('Sync failed', 500);
  }
}
