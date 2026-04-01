import type { NextRequest } from 'next/server';
import { unstable_cache } from 'next/cache';
import { auth } from '@/lib/auth';
import { getActiveBusinessId } from '@/lib/business';
import {
  getKpiData,
  getChartData,
  getRecentActivity,
  getPlatformPerformance,
} from '@/services/dashboardService';
import { successResponse, errorResponse } from '@/lib/api';

const getCachedDashboard = unstable_cache(
  async (period: string, businessId: string) => {
    const [kpi, chart, recentActivity, platformPerformance] = await Promise.all([
      getKpiData(period, businessId),
      getChartData(period, businessId),
      getRecentActivity(businessId),
      getPlatformPerformance(businessId),
    ]);
    return { kpi, chart, recentActivity, platformPerformance };
  },
  ['dashboard'],
  { revalidate: 300, tags: ['dashboard'] }
);

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const { searchParams } = request.nextUrl;
    const businessId = await getActiveBusinessId(session.user.id, searchParams.get('businessId'));
    if (!businessId) return errorResponse('Business not found', 404);

    const period = searchParams.get('period') ?? '30';

    const data = await getCachedDashboard(period, businessId);

    return successResponse(data);
  } catch {
    return errorResponse('Failed to fetch dashboard data', 500);
  }
}
