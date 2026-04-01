import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    const { accountId, locationId, locationName, businessId } = body;

    if (!accountId || !locationId || !businessId) {
      return errorResponse('accountId, locationId, and businessId are required', 400);
    }

    // Upsert Google platform for this business
    const existing = await prisma.platform.findFirst({
      where: { businessId, type: 'GOOGLE' },
    });

    const platform = existing
      ? await prisma.platform.update({
          where: { id: existing.id },
          data: {
            status: 'CONNECTED',
            accountId,
            locationId,
            name: locationName || 'Google Business',
            detail: 'Connected — awaiting first sync',
          },
        })
      : await prisma.platform.create({
          data: {
            type: 'GOOGLE',
            name: locationName || 'Google Business',
            status: 'CONNECTED',
            accountId,
            locationId,
            detail: 'Connected — awaiting first sync',
            businessId,
          },
        });

    return successResponse(platform, 201);
  } catch (error) {
    console.error('Failed to connect Google:', error);
    return errorResponse('Failed to connect Google platform', 500);
  }
}
