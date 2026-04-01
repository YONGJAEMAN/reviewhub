import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { createReply } from '@/services/reviewService';
import { successResponse, errorResponse } from '@/lib/api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const body = await request.json();
    const { content } = body;
    if (!content?.trim()) return errorResponse('Reply content is required');

    const review = await createReply(id, content.trim(), session.user.id);
    if (!review) return errorResponse('Review not found', 404);
    return successResponse(review, 201);
  } catch {
    return errorResponse('Failed to create reply', 500);
  }
}
