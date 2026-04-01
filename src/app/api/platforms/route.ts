import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getActiveBusinessId } from '@/lib/business';
import { getPlatforms } from '@/services/platformService';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const businessId = await getActiveBusinessId(
      session.user.id,
      request.nextUrl.searchParams.get('businessId')
    );

    const platforms = await getPlatforms(businessId ?? undefined);
    return successResponse(platforms);
  } catch {
    return errorResponse('Failed to fetch platforms', 500);
  }
}
