import { prisma } from '@/lib/prisma';
import { platformComparison } from '@/data/mockData';
import type {
  SentimentTrendPoint,
  RatingDistItem,
  PlatformComparisonData,
  TopKeyword,
} from '@/types';

export async function getSentimentTrend(businessId?: string): Promise<SentimentTrendPoint[]> {
  const where: Record<string, unknown> = { sentimentLabel: { not: null } };
  if (businessId) where.businessId = businessId;

  const reviews = await prisma.review.findMany({
    where,
    select: { postedAt: true, sentimentLabel: true },
    orderBy: { postedAt: 'asc' },
  });

  // Group by month (last 6 months)
  const now = new Date();
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleString('en-US', { month: 'short' }));
  }

  const buckets: Record<string, { positive: number; negative: number }> = {};
  for (const m of months) buckets[m] = { positive: 0, negative: 0 };

  for (const r of reviews) {
    const month = r.postedAt.toLocaleString('en-US', { month: 'short' });
    if (!buckets[month]) continue;
    if (r.sentimentLabel === 'positive') buckets[month].positive++;
    else if (r.sentimentLabel === 'negative') buckets[month].negative++;
  }

  return months.map((month) => ({
    month,
    positive: buckets[month].positive,
    negative: buckets[month].negative,
  }));
}

export async function getRatingDistribution(businessId?: string): Promise<RatingDistItem[]> {
  const where = businessId ? { businessId } : {};
  const reviews = await prisma.review.findMany({ where, select: { rating: true } });

  if (reviews.length === 0) {
    return [5, 4, 3, 2, 1].map((stars) => ({ stars, percentage: 0, count: 0 }));
  }

  const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const r of reviews) {
    counts[r.rating] = (counts[r.rating] || 0) + 1;
  }

  const total = reviews.length;
  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    percentage: Math.round((counts[stars] / total) * 100),
    count: counts[stars],
  }));
}

export async function getPlatformComparison(): Promise<PlatformComparisonData[]> {
  // Response rate/time require detailed reply tracking; use mock for now
  return platformComparison;
}

export async function getTopKeywords(businessId?: string): Promise<TopKeyword[]> {
  const where: Record<string, unknown> = {};
  if (businessId) where.businessId = businessId;

  const reviews = await prisma.review.findMany({
    where: { ...where, sentimentKeywords: { isEmpty: false } },
    select: { sentimentKeywords: true },
  });

  // Count keyword frequency
  const freq: Record<string, number> = {};
  for (const r of reviews) {
    for (const kw of r.sentimentKeywords) {
      const normalized = kw.toLowerCase();
      freq[normalized] = (freq[normalized] || 0) + 1;
    }
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword, count]) => ({ keyword, count }));
}
