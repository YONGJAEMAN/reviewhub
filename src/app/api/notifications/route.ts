import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getActiveBusinessId } from '@/lib/business';
import { getNotificationsForBusiness, getUnreadCount, markAllAsRead } from '@/services/notificationService';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const { searchParams } = request.nextUrl;
    const businessId = await getActiveBusinessId(session.user.id, searchParams.get('businessId'));
    if (!businessId) return errorResponse('Business not found', 404);

    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const [notifications, unreadCount] = await Promise.all([
      getNotificationsForBusiness(businessId, { unreadOnly, limit }),
      getUnreadCount(businessId),
    ]);

    return successResponse({ notifications, unreadCount });
  } catch {
    return errorResponse('Failed to fetch notifications', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const { businessId: reqBusinessId } = await request.json();
    const businessId = await getActiveBusinessId(session.user.id, reqBusinessId);
    if (!businessId) return errorResponse('Business not found', 404);

    await markAllAsRead(businessId);
    return successResponse({ success: true });
  } catch {
    return errorResponse('Failed to mark all as read', 500);
  }
}
