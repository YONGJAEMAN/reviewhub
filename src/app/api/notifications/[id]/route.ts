import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { markAsRead } from '@/services/notificationService';
import { successResponse, errorResponse } from '@/lib/api';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    await markAsRead(id);
    return successResponse({ success: true });
  } catch {
    return errorResponse('Failed to mark as read', 500);
  }
}
