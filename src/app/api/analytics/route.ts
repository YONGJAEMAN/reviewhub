import type { NextRequest } from 'next/server';
import { unstable_cache } from 'next/cache';
import { auth } from '@/lib/auth';
import { getActiveBusinessId } from '@/lib/business';
import {
  getSentimentTrend,
  getRatingDistribution,
  getPlatformComparison,
  getTopKeywords,
} from '@/services/analyticsService';
import { successResponse, errorResponse } from '@/lib/api';

const getCachedAnalytics = unstable_cache(
  async (businessId: string) => {
    const [sentimentTrend, ratingDistribution, platformComparison, topKeywords] =
      await Promise.all([
        getSentimentTrend(businessId),
        getRatingDistribution(businessId),
        getPlatformComparison(),
        getTopKeywords(businessId),
      ]);
    return { sentimentTrend, ratingDistribution, platformComparison, topKeywords };
  },
  ['analytics'],
  { revalidate: 600, tags: ['analytics'] }
);

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const businessId = await getActiveBusinessId(
      session.user.id,
      request.nextUrl.searchParams.get('businessId')
    );
    if (!businessId) return errorResponse('Business not found', 404);

    const data = await getCachedAnalytics(businessId);

    return successResponse(data);
  } catch {
    return errorResponse('Failed to fetch analytics data', 500);
  }
}
