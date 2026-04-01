import { prisma } from '@/lib/prisma';
import type { Review, ReviewerHistory } from '@/types';
import type { PlatformType, ReviewStatus as DbReviewStatus, Prisma } from '@/generated/prisma/client';

export interface ReviewFilters {
  platform?: string;
  rating?: number;
  status?: string;
  search?: string;
}

export interface ReviewSort {
  field: 'postedAt' | 'rating';
  order: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

const platformMap: Record<string, PlatformType> = {
  google: 'GOOGLE',
  yelp: 'YELP',
  facebook: 'FACEBOOK',
  whatsapp: 'WHATSAPP',
};

const statusMap: Record<string, DbReviewStatus> = {
  action_required: 'ACTION_REQUIRED',
  high_priority: 'HIGH_PRIORITY',
  replied: 'REPLIED',
  pending: 'PENDING',
};

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

function toFrontendReview(r: {
  id: string;
  platform: PlatformType;
  authorName: string;
  authorAvatar: string | null;
  authorInitials: string;
  isVerified: boolean;
  localGuide: boolean;
  reviewCount: number | null;
  rating: number;
  title: string | null;
  content: string;
  tags: string[];
  status: DbReviewStatus;
  postedAt: Date;
  reply?: { content: string; repliedAt: Date } | null;
}): Review {
  return {
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
  };
}

export async function getReviews(
  filters?: ReviewFilters,
  sort?: ReviewSort,
  pagination?: PaginationParams,
  businessId?: string
): Promise<PaginatedResult<Review>> {
  const where: Prisma.ReviewWhereInput = {};

  if (businessId) where.businessId = businessId;

  if (filters?.platform && filters.platform !== 'all') {
    const dbPlatform = platformMap[filters.platform];
    if (dbPlatform) where.platform = dbPlatform;
  }
  if (filters?.rating) {
    where.rating = filters.rating;
  }
  if (filters?.status && filters.status !== 'all') {
    const dbStatus = statusMap[filters.status];
    if (dbStatus) where.status = dbStatus;
  }
  if (filters?.search) {
    const q = filters.search;
    where.OR = [
      { authorName: { contains: q, mode: 'insensitive' } },
      { title: { contains: q, mode: 'insensitive' } },
      { content: { contains: q, mode: 'insensitive' } },
    ];
  }

  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 10;

  const orderBy: Prisma.ReviewOrderByWithRelationInput[] = [];
  if (sort?.field === 'rating') {
    orderBy.push({ rating: sort.order });
  } else {
    orderBy.push({ postedAt: sort?.order ?? 'desc' });
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { reply: true },
    }),
    prisma.review.count({ where }),
  ]);

  return {
    data: reviews.map(toFrontendReview),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getReviewById(id: string): Promise<Review | null> {
  const review = await prisma.review.findUnique({
    where: { id },
    include: { reply: true },
  });
  if (!review) return null;
  return toFrontendReview(review);
}

export async function updateReviewStatus(
  id: string,
  status: Review['status']
): Promise<Review | null> {
  const dbStatus = statusMap[status];
  if (!dbStatus) return null;

  const review = await prisma.review.update({
    where: { id },
    data: { status: dbStatus },
    include: { reply: true },
  });
  return toFrontendReview(review);
}

export async function createReply(
  reviewId: string,
  content: string,
  userId?: string
): Promise<Review | null> {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) return null;

  // Push reply to external platform API if applicable
  if (review.externalId) {
    if (review.platform === 'GOOGLE' && userId) {
      const { replyToGoogleReview } = await import('@/services/googleReviewService');
      const result = await replyToGoogleReview(reviewId, content, userId);
      if (!result.success) console.warn(`Google reply API failed: ${result.error}`);
    } else if (review.platform === 'FACEBOOK') {
      const { replyToFBReview } = await import('@/services/facebookReviewService');
      const result = await replyToFBReview(reviewId, content);
      if (!result.success) console.warn(`Facebook reply API failed: ${result.error}`);
    }
  }

  // Save reply to DB (upsert in case Google service already created it)
  await prisma.reply.upsert({
    where: { reviewId },
    update: { content },
    create: { content, reviewId },
  });

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: { status: 'REPLIED' },
    include: { reply: true },
  });
  return toFrontendReview(updated);
}

export async function getReviewerHistory(
  reviewId: string
): Promise<ReviewerHistory[]> {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) return [];

  const otherReviews = await prisma.review.findMany({
    where: {
      authorName: review.authorName,
      businessId: review.businessId,
      id: { not: reviewId },
    },
    orderBy: { postedAt: 'desc' },
    take: 5,
  });

  return otherReviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title ?? r.content.slice(0, 40),
    date: formatRelativeTime(r.postedAt),
  }));
}
