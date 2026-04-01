import { prisma } from '@/lib/prisma';
import type { KpiData, ChartDataPoint, Review, PlatformPerformanceData } from '@/types';
import type { PlatformType } from '@/generated/prisma/client';

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

export async function getKpiData(period: string, businessId?: string): Promise<KpiData[]> {
  const days = parseInt(period, 10) || 30;
  const now = new Date();
  const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const prevStart = new Date(periodStart.getTime() - days * 24 * 60 * 60 * 1000);

  const where = {
    ...(businessId ? { businessId } : {}),
    postedAt: { gte: periodStart },
  };
  const prevWhere = {
    ...(businessId ? { businessId } : {}),
    postedAt: { gte: prevStart, lt: periodStart },
  };

  const [current, prev] = await Promise.all([
    prisma.review.findMany({ where, select: { rating: true, sentimentLabel: true, status: true } }),
    prisma.review.findMany({ where: prevWhere, select: { rating: true, sentimentLabel: true, status: true } }),
  ]);

  const totalCurrent = current.length;
  const totalPrev = prev.length;

  // Overall Rating
  const avgRating = totalCurrent > 0
    ? current.reduce((sum, r) => sum + r.rating, 0) / totalCurrent
    : 0;
  const prevAvgRating = totalPrev > 0
    ? prev.reduce((sum, r) => sum + r.rating, 0) / totalPrev
    : 0;
  const ratingChange = prevAvgRating > 0
    ? ((avgRating - prevAvgRating) / prevAvgRating * 100).toFixed(1)
    : '0';

  // Positive Sentiment
  const positiveCount = current.filter((r) => r.sentimentLabel === 'positive').length;
  const positivePct = totalCurrent > 0 ? Math.round((positiveCount / totalCurrent) * 100) : 0;
  const prevPositive = totalPrev > 0
    ? Math.round((prev.filter((r) => r.sentimentLabel === 'positive').length / totalPrev) * 100)
    : 0;
  const sentimentChange = prevPositive > 0
    ? (positivePct - prevPositive).toString()
    : '0';

  // Response Rate
  const repliedCount = current.filter((r) => r.status === 'REPLIED').length;
  const responseRate = totalCurrent > 0 ? Math.round((repliedCount / totalCurrent) * 100) : 0;
  const prevReplied = totalPrev > 0
    ? Math.round((prev.filter((r) => r.status === 'REPLIED').length / totalPrev) * 100)
    : 0;
  const responseChange = prevReplied > 0
    ? (responseRate - prevReplied).toString()
    : '0';

  return [
    {
      label: 'Overall Rating',
      value: avgRating > 0 ? avgRating.toFixed(1) : '—',
      change: `${Number(ratingChange) >= 0 ? '+' : ''}${ratingChange}%`,
      positive: Number(ratingChange) >= 0,
      icon: 'star',
    },
    {
      label: 'Total Reviews',
      value: totalCurrent.toString(),
      change: totalPrev > 0
        ? `${totalCurrent >= totalPrev ? '+' : ''}${totalCurrent - totalPrev}`
        : '+0',
      positive: totalCurrent >= totalPrev,
      icon: 'message',
    },
    {
      label: 'Positive Sentiment',
      value: `${positivePct}%`,
      change: `${Number(sentimentChange) >= 0 ? '+' : ''}${sentimentChange}%`,
      positive: Number(sentimentChange) >= 0,
      icon: 'thumbsUp',
    },
    {
      label: 'Response Rate',
      value: `${responseRate}%`,
      change: `${Number(responseChange) >= 0 ? '+' : ''}${responseChange}%`,
      positive: Number(responseChange) >= 0,
      icon: 'reply',
    },
  ];
}

export async function getChartData(period: string, businessId?: string): Promise<ChartDataPoint[]> {
  const days = parseInt(period, 10) || 30;
  const now = new Date();
  const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const prevStart = new Date(periodStart.getTime() - days * 24 * 60 * 60 * 1000);

  const where = businessId ? { businessId } : {};

  const [currentReviews, prevReviews] = await Promise.all([
    prisma.review.findMany({
      where: { ...where, postedAt: { gte: periodStart } },
      select: { postedAt: true },
      orderBy: { postedAt: 'asc' },
    }),
    prisma.review.findMany({
      where: { ...where, postedAt: { gte: prevStart, lt: periodStart } },
      select: { postedAt: true },
      orderBy: { postedAt: 'asc' },
    }),
  ]);

  // Group into 4 buckets (weeks)
  const bucketSize = Math.ceil(days / 4);
  const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

  const result: ChartDataPoint[] = labels.map((week, i) => {
    const bucketStart = new Date(periodStart.getTime() + i * bucketSize * 24 * 60 * 60 * 1000);
    const bucketEnd = new Date(bucketStart.getTime() + bucketSize * 24 * 60 * 60 * 1000);
    const prevBucketStart = new Date(prevStart.getTime() + i * bucketSize * 24 * 60 * 60 * 1000);
    const prevBucketEnd = new Date(prevBucketStart.getTime() + bucketSize * 24 * 60 * 60 * 1000);

    return {
      week,
      thisMonth: currentReviews.filter((r) => r.postedAt >= bucketStart && r.postedAt < bucketEnd).length,
      lastMonth: prevReviews.filter((r) => r.postedAt >= prevBucketStart && r.postedAt < prevBucketEnd).length,
    };
  });

  return result;
}

export async function getRecentActivity(businessId?: string): Promise<Review[]> {
  const reviews = await prisma.review.findMany({
    where: businessId ? { businessId } : undefined,
    orderBy: { postedAt: 'desc' },
    take: 3,
    include: { reply: true },
  });

  return reviews.map((r) => ({
    id: r.id,
    platform: r.platform.toLowerCase() as Review['platform'],
    authorName: r.authorName,
    authorAvatar: r.authorAvatar ?? undefined,
    authorInitials: r.authorInitials,
    isVerified: r.isVerified,
    localGuide: r.localGuide || undefined,
    reviewCount: r.reviewCount ?? undefined,
    rating: r.rating,
    title: r.title ?? undefined,
    content: r.content,
    tags: r.tags,
    status: r.status.toLowerCase().replace('_', '_') as Review['status'],
    postedAt: formatRelativeTime(r.postedAt),
    reply: r.reply
      ? { content: r.reply.content, repliedAt: formatRelativeTime(r.reply.repliedAt) }
      : undefined,
  }));
}

const platformColors: Record<string, string> = {
  GOOGLE: '#4285F4',
  YELP: '#D32323',
  FACEBOOK: '#1877F2',
  WHATSAPP: '#25D366',
};

export async function getPlatformPerformance(businessId?: string): Promise<PlatformPerformanceData[]> {
  const where = businessId ? { businessId } : {};
  const reviews = await prisma.review.findMany({ where, select: { platform: true, rating: true } });

  const grouped: Record<string, { total: number; count: number }> = {};
  for (const r of reviews) {
    if (!grouped[r.platform]) grouped[r.platform] = { total: 0, count: 0 };
    grouped[r.platform].total += r.rating;
    grouped[r.platform].count += 1;
  }

  const platforms: PlatformType[] = ['GOOGLE', 'YELP', 'FACEBOOK', 'WHATSAPP'];
  return platforms
    .filter((p) => grouped[p])
    .map((p) => ({
      platform: p.toLowerCase() as PlatformPerformanceData['platform'],
      rating: Math.round((grouped[p].total / grouped[p].count) * 10) / 10,
      reviews: grouped[p].count,
      color: platformColors[p],
    }));
}
