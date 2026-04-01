import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    const { pageId, pageName, pageAccessToken, businessId } = body;

    if (!pageId || !pageAccessToken || !businessId) {
      return errorResponse('pageId, pageAccessToken, and businessId are required', 400);
    }

    const existing = await prisma.platform.findFirst({
      where: { businessId, type: 'FACEBOOK' },
    });

    const platform = existing
      ? await prisma.platform.update({
          where: { id: existing.id },
          data: {
            status: 'CONNECTED',
            externalId: pageId,
            accessToken: pageAccessToken,
            name: pageName || 'Facebook Page',
            detail: `Connected · ${pageName}`,
          },
        })
      : await prisma.platform.create({
          data: {
            type: 'FACEBOOK',
            name: pageName || 'Facebook Page',
            status: 'CONNECTED',
            externalId: pageId,
            accessToken: pageAccessToken,
            detail: `Connected · ${pageName}`,
            businessId,
          },
        });

    return successResponse(platform, 201);
  } catch (error) {
    console.error('Failed to connect Facebook:', error);
    return errorResponse('Failed to connect Facebook', 500);
  }
}
