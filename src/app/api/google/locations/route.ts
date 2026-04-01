import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getGoogleAccessToken, listGoogleLocations } from '@/lib/google';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const accountId = request.nextUrl.searchParams.get('accountId');
    if (!accountId) return errorResponse('accountId is required', 400);

    const accessToken = await getGoogleAccessToken(session.user.id);
    if (!accessToken) {
      return errorResponse('No Google account linked', 400);
    }

    const locations = await listGoogleLocations(accessToken, accountId);
    return successResponse(locations);
  } catch (error) {
    console.error('Failed to list Google locations:', error);
    return errorResponse('Failed to fetch Google locations', 500);
  }
}
