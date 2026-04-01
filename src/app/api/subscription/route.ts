import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getActiveBusinessId } from '@/lib/business';
import { getSubscriptionInfo } from '@/lib/planLimits';
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

    const info = await getSubscriptionInfo(businessId);
    return successResponse(info);
  } catch {
    return errorResponse('Failed to fetch subscription', 500);
  }
}
