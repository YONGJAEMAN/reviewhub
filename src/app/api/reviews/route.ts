import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getActiveBusinessId } from '@/lib/business';
import { getReviews } from '@/services/reviewService';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const { searchParams } = request.nextUrl;

    const businessId = await getActiveBusinessId(session.user.id, searchParams.get('businessId'));
    if (!businessId) return errorResponse('Business not found', 404);

    const filters = {
      platform: searchParams.get('platform') ?? undefined,
      rating: searchParams.get('rating')
        ? Number(searchParams.get('rating'))
        : undefined,
      status: searchParams.get('status') ?? undefined,
      search: searchParams.get('search') ?? undefined,
    };

    const sortField = searchParams.get('sortField') as 'postedAt' | 'rating' | null;
    const sort = sortField
      ? {
          field: sortField,
          order: (searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc',
        }
      : undefined;

    const pagination = {
      page: Number(searchParams.get('page') ?? '1'),
      limit: Number(searchParams.get('limit') ?? '10'),
    };

    const result = await getReviews(filters, sort, pagination, businessId);
    return successResponse(result);
  } catch {
    return errorResponse('Failed to fetch reviews', 500);
  }
}
