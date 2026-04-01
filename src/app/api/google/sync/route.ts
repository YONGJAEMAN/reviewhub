import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { syncGoogleReviews } from '@/services/googleReviewService';
import { successResponse, errorResponse } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    const { platformId } = body;
    if (!platformId) return errorResponse('platformId is required', 400);

    const result = await syncGoogleReviews(platformId);
    return successResponse(result);
  } catch (error) {
    console.error('Manual Google sync failed:', error);
    return errorResponse('Sync failed', 500);
  }
}
