import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendReviewRequest } from '@/lib/whatsapp';
import { checkPlanLimit } from '@/lib/planLimits';
import { getActiveBusinessId } from '@/lib/business';
import { successResponse, errorResponse } from '@/lib/api';
import type { PlatformType } from '@/generated/prisma/client';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    const { phone, customerName, businessName, reviewLink, platform, businessId: reqBusinessId } = body;

    const businessId = await getActiveBusinessId(session.user.id, reqBusinessId);
    if (!businessId) return errorResponse('Business not found', 404);

    // Check plan limit
    const limitCheck = await checkPlanLimit(businessId, 'whatsapp');
    if (!limitCheck.allowed) {
      return errorResponse(
        `WhatsApp request limit reached (${limitCheck.limit}/month). Upgrade your plan for more.`,
        429
      );
    }

    if (!phone || !customerName || !businessName || !reviewLink) {
      return errorResponse('phone, customerName, businessName, and reviewLink are required', 400);
    }

    const { messageId } = await sendReviewRequest({
      phone,
      customerName,
      businessName,
      reviewLink,
    });

    const reviewRequest = await prisma.reviewRequest.create({
      data: {
        phone,
        customerName,
        platform: (platform?.toUpperCase() || 'GOOGLE') as PlatformType,
        status: 'SENT',
        messageId,
        businessId,
      },
    });

    return successResponse(reviewRequest, 201);
  } catch (error) {
    console.error('WhatsApp send failed:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to send WhatsApp message',
      500
    );
  }
}
