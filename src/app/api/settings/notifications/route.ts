import type { NextRequest } from 'next/server';
import { getNotifications, updateNotifications } from '@/services/settingsService';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET() {
  try {
    const notifications = await getNotifications();
    return successResponse(notifications);
  } catch {
    return errorResponse('Failed to fetch notifications', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const notifications = await updateNotifications(body);
    return successResponse(notifications);
  } catch {
    return errorResponse('Failed to update notifications', 500);
  }
}
