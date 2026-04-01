import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getActiveBusinessId } from '@/lib/business';
import { getCompetitors, addCompetitor, getCompetitorBenchmark } from '@/services/competitorService';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse('Unauthorized', 401);

  const businessId = await getActiveBusinessId(
    session.user.id,
    request.nextUrl.searchParams.get('businessId') ?? undefined
  );
  if (!businessId) return errorResponse('No business found', 404);

  const mode = request.nextUrl.searchParams.get('mode');

  if (mode === 'benchmark') {
    const benchmark = await getCompetitorBenchmark(businessId);
    return successResponse(benchmark);
  }

  const competitors = await getCompetitors(businessId);
  return successResponse(competitors);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse('Unauthorized', 401);

  const body = await request.json();
  const { businessId: bid, name, googlePlaceId, address, rating, totalReviews } = body;

  const businessId = await getActiveBusinessId(session.user.id, bid);
  if (!businessId) return errorResponse('No business found', 404);

  if (!name || !googlePlaceId) {
    return errorResponse('Name and Google Place ID required', 400);
  }

  try {
    const competitor = await addCompetitor(businessId, { name, googlePlaceId, address, rating, totalReviews });
    return successResponse(competitor);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to add competitor';
    return errorResponse(msg, 400);
  }
}
