import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getActiveBusinessId } from '@/lib/business';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const { searchParams } = request.nextUrl;
    const businessId = await getActiveBusinessId(session.user.id, searchParams.get('businessId'));
    if (!businessId) return errorResponse('Business not found', 404);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const [requests, total] = await Promise.all([
      prisma.reviewRequest.findMany({
        where: { businessId },
        orderBy: { sentAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.reviewRequest.count({ where: { businessId } }),
    ]);

    return successResponse({
      data: requests,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('WhatsApp history error:', error);
    return errorResponse('Failed to fetch history', 500);
  }
}
