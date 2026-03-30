import type { NextRequest } from 'next/server';
import { createReply } from '@/services/reviewService';
import { successResponse, errorResponse } from '@/lib/api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content } = body;
    if (!content?.trim()) return errorResponse('Reply content is required');

    const review = await createReply(id, content.trim());
    if (!review) return errorResponse('Review not found', 404);
    return successResponse(review, 201);
  } catch {
    return errorResponse('Failed to create reply', 500);
  }
}
