import { prisma } from '@/lib/prisma';

export interface ReportData {
  businessName: string;
  period: { start: Date; end: Date };
  kpi: {
    totalReviews: number;
    avgRating: number;
    positivePercent: number;
    responseRate: number;
  };
  platformBreakdown: Array<{
    platform: string;
    reviews: number;
    avgRating: number;
  }>;
  topReviews: Array<{
    authorName: string;
    platform: string;
    rating: number;
    content: string;
    postedAt: Date;
  }>;
}

export async function getReportData(businessId: string, days: number): Promise<ReportData> {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { name: true },
  });

  const reviews = await prisma.review.findMany({
    where: { businessId, postedAt: { gte: start, lte: end } },
    select: {
      platform: true,
      rating: true,
      content: true,
      authorName: true,
      postedAt: true,
      sentimentLabel: true,
      status: true,
    },
    orderBy: { postedAt: 'desc' },
  });

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;
  const positiveCount = reviews.filter((r) => r.sentimentLabel === 'positive').length;
  const positivePercent = totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 0;
  const repliedCount = reviews.filter((r) => r.status === 'REPLIED').length;
  const responseRate = totalReviews > 0 ? Math.round((repliedCount / totalReviews) * 100) : 0;

  // Platform breakdown
  const platformMap: Record<string, { reviews: number; totalRating: number }> = {};
  for (const r of reviews) {
    if (!platformMap[r.platform]) platformMap[r.platform] = { reviews: 0, totalRating: 0 };
    platformMap[r.platform].reviews += 1;
    platformMap[r.platform].totalRating += r.rating;
  }
  const platformBreakdown = Object.entries(platformMap).map(([platform, data]) => ({
    platform,
    reviews: data.reviews,
    avgRating: Math.round((data.totalRating / data.reviews) * 10) / 10,
  }));

  // Top 5 reviews by rating
  const topReviews = reviews
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5)
    .map((r) => ({
      authorName: r.authorName,
      platform: r.platform,
      rating: r.rating,
      content: r.content.slice(0, 200),
      postedAt: r.postedAt,
    }));

  return {
    businessName: business?.name ?? 'My Business',
    period: { start, end },
    kpi: { totalReviews, avgRating: Math.round(avgRating * 10) / 10, positivePercent, responseRate },
    platformBreakdown,
    topReviews,
  };
}
