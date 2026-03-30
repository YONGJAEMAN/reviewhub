import type { NextRequest } from 'next/server';
import {
  getKpiData,
  getChartData,
  getRecentActivity,
  getPlatformPerformance,
} from '@/services/dashboardService';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const period = request.nextUrl.searchParams.get('period') ?? '30';

    const [kpi, chart, recentActivity, platformPerformance] = await Promise.all([
      getKpiData(period),
      getChartData(period),
      getRecentActivity(),
      getPlatformPerformance(),
    ]);

    return successResponse({ kpi, chart, recentActivity, platformPerformance });
  } catch {
    return errorResponse('Failed to fetch dashboard data', 500);
  }
}
