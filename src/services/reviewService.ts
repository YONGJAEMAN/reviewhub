import {
  reviews as mockReviews,
  reviewerHistories as mockHistories,
} from '@/data/mockData';
import type { Review, ReviewerHistory } from '@/types';

export interface ReviewFilters {
  platform?: string;
  rating?: number;
  status?: string;
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

const sortOrder: Record<string, number> = {
  action_required: 0,
  high_priority: 1,
  replied: 2,
};

export async function getReviews(
  filters?: ReviewFilters,
  sort?: ReviewSort,
  pagination?: PaginationParams
): Promise<PaginatedResult<Review>> {
  // TODO: Replace with Prisma query
  let result = [...mockReviews];

  if (filters?.platform && filters.platform !== 'all') {
    result = result.filter((r) => r.platform === filters.platform);
  }
  if (filters?.rating) {
    result = result.filter((r) => r.rating === filters.rating);
  }
  if (filters?.status && filters.status !== 'all') {
    result = result.filter((r) => r.status === filters.status);
  }

  if (sort) {
    result.sort((a, b) => {
      if (sort.field === 'rating') {
        return sort.order === 'asc' ? a.rating - b.rating : b.rating - a.rating;
      }
      // Default: sort by status priority, then postedAt
      const statusDiff = sortOrder[a.status] - sortOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return sort.order === 'asc' ? 0 : 0; // mock data doesn't have real dates
    });
  }

  const total = result.length;
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 10;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  result = result.slice(start, start + limit);

  return { data: result, total, page, totalPages };
}

export async function getReviewById(id: string): Promise<Review | null> {
  // TODO: Replace with Prisma findUnique
  return mockReviews.find((r) => r.id === id) ?? null;
}

export async function updateReviewStatus(
  id: string,
  status: Review['status']
): Promise<Review | null> {
  // TODO: Replace with Prisma update
  const review = mockReviews.find((r) => r.id === id);
  if (!review) return null;
  return { ...review, status };
}

export async function createReply(
  reviewId: string,
  content: string
): Promise<Review | null> {
  // TODO: Replace with Prisma transaction (create Reply + update Review status)
  const review = mockReviews.find((r) => r.id === reviewId);
  if (!review) return null;
  return {
    ...review,
    status: 'replied',
    reply: { content, repliedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
  };
}

export async function getReviewerHistory(
  reviewId: string
): Promise<ReviewerHistory[]> {
  // TODO: Replace with Prisma query (find other reviews by same author)
  return mockHistories[reviewId] ?? [];
}
