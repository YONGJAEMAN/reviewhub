import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getActiveBusinessId } from '@/lib/business';
import { getNotifications, updateNotifications } from '@/services/settingsService';
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

    const notifications = await getNotifications(businessId);
    return successResponse(notifications);
  } catch {
    return errorResponse('Failed to fetch notifications', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    const businessId = await getActiveBusinessId(session.user.id, body.businessId);
    if (!businessId) return errorResponse('Business not found', 404);

    const notifications = await updateNotifications(body.notifications ?? body, businessId);
    return successResponse(notifications);
  } catch {
    return errorResponse('Failed to update notifications', 500);
  }
}
