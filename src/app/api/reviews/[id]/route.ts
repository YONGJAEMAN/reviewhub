import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getReviewById, updateReviewStatus, getReviewerHistory } from '@/services/reviewService';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const [review, history] = await Promise.all([
      getReviewById(id),
      getReviewerHistory(id),
    ]);
    if (!review) return errorResponse('Review not found', 404);
    return successResponse({ review, history });
  } catch {
    return errorResponse('Failed to fetch review', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const body = await request.json();
    const { status } = body;
    if (!status) return errorResponse('Status is required');

    const review = await updateReviewStatus(id, status);
    if (!review) return errorResponse('Review not found', 404);
    return successResponse(review);
  } catch {
    return errorResponse('Failed to update review', 500);
  }
}
