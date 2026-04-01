import { NextRequest } from 'next/server';
import { syncAllGooglePlatforms } from '@/services/googleReviewService';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return errorResponse('Unauthorized', 401);
    }

    const result = await syncAllGooglePlatforms();

    console.log(
      `[Cron] Google sync: ${result.synced} reviews synced from ${result.total} platforms` +
      (result.errors.length ? ` (${result.errors.length} errors)` : '')
    );

    return successResponse(result);
  } catch (error) {
    console.error('[Cron] Google sync failed:', error);
    return errorResponse('Sync failed', 500);
  }
}
