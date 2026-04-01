import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    const { yelpBusinessId, businessName, businessId } = body;

    if (!yelpBusinessId || !businessId) {
      return errorResponse('yelpBusinessId and businessId are required', 400);
    }

    const existing = await prisma.platform.findFirst({
      where: { businessId, type: 'YELP' },
    });

    const platform = existing
      ? await prisma.platform.update({
          where: { id: existing.id },
          data: {
            status: 'CONNECTED',
            externalId: yelpBusinessId,
            name: businessName || 'Yelp',
            detail: 'Connected — free tier: 3 most recent reviews',
          },
        })
      : await prisma.platform.create({
          data: {
            type: 'YELP',
            name: businessName || 'Yelp',
            status: 'CONNECTED',
            externalId: yelpBusinessId,
            detail: 'Connected — free tier: 3 most recent reviews',
            businessId,
          },
        });

    return successResponse(platform, 201);
  } catch (error) {
    console.error('Failed to connect Yelp:', error);
    return errorResponse('Failed to connect Yelp', 500);
  }
}
