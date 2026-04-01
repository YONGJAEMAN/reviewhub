import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { searchNearbyBusinesses } from '@/services/competitorService';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse('Unauthorized', 401);

  const query = request.nextUrl.searchParams.get('q');
  if (!query) return errorResponse('Query required', 400);

  try {
    const results = await searchNearbyBusinesses(query);
    return successResponse(results);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Search failed';
    return errorResponse(msg, 500);
  }
}
