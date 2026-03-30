import type { NextRequest } from 'next/server';
import { getReviewById, updateReviewStatus } from '@/services/reviewService';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const review = await getReviewById(id);
    if (!review) return errorResponse('Review not found', 404);
    return successResponse(review);
  } catch {
    return errorResponse('Failed to fetch review', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
