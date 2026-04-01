import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { searchYelpBusinesses } from '@/lib/yelp';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const term = request.nextUrl.searchParams.get('term');
    const location = request.nextUrl.searchParams.get('location');
    if (!term || !location) {
      return errorResponse('term and location are required', 400);
    }

    const businesses = await searchYelpBusinesses(term, location);
    return successResponse(businesses);
  } catch (error) {
    console.error('Yelp search failed:', error);
    return errorResponse('Failed to search Yelp', 500);
  }
}
