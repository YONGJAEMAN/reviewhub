import {
  getSentimentTrend,
  getRatingDistribution,
  getPlatformComparison,
  getTopKeywords,
} from '@/services/analyticsService';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET() {
  try {
    const [sentimentTrend, ratingDistribution, platformComparison, topKeywords] =
      await Promise.all([
        getSentimentTrend(),
        getRatingDistribution(),
        getPlatformComparison(),
        getTopKeywords(),
      ]);

    return successResponse({
      sentimentTrend,
      ratingDistribution,
      platformComparison,
      topKeywords,
    });
  } catch {
    return errorResponse('Failed to fetch analytics data', 500);
  }
}
