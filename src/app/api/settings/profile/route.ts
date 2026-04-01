import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getActiveBusinessId } from '@/lib/business';
import { getProfile, updateProfile } from '@/services/settingsService';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const businessId = await getActiveBusinessId(
      session.user.id,
      request.nextUrl.searchParams.get('businessId')
    );
    if (!businessId) return errorResponse('Business not found', 404);

    const profile = await getProfile(businessId);
    return successResponse(profile);
  } catch {
    return errorResponse('Failed to fetch profile', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    const businessId = await getActiveBusinessId(session.user.id, body.businessId);
    if (!businessId) return errorResponse('Business not found', 404);

    const profile = await updateProfile(body, businessId);
    return successResponse(profile);
  } catch {
    return errorResponse('Failed to update profile', 500);
  }
}
