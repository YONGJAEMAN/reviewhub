import {
  kpiByPeriod,
  chartByPeriod,
  reviews,
  platformPerformance,
} from '@/data/mockData';
import type { KpiData, ChartDataPoint, Review, PlatformPerformanceData } from '@/types';

export async function getKpiData(period: string): Promise<KpiData[]> {
  // TODO: Replace with aggregated DB queries
  return kpiByPeriod[period] ?? kpiByPeriod['30'];
}

export async function getChartData(period: string): Promise<ChartDataPoint[]> {
  // TODO: Replace with grouped DB queries
  return chartByPeriod[period] ?? chartByPeriod['30'];
}

export async function getRecentActivity(): Promise<Review[]> {
  // TODO: Replace with Prisma query (latest 3 reviews)
  return reviews.slice(0, 3);
}

export async function getPlatformPerformance(): Promise<PlatformPerformanceData[]> {
  // TODO: Replace with aggregated DB queries per platform
  return platformPerformance;
}
