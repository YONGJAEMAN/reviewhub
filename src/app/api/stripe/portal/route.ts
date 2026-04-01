import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';
import { getActiveBusinessId, verifyBusinessAccess, hasPermission } from '@/lib/business';
import { successResponse, errorResponse } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const body = await request.json().catch(() => ({}));
    const businessId = await getActiveBusinessId(session.user.id, body.businessId);
    if (!businessId) return errorResponse('Business not found', 404);

    const access = await verifyBusinessAccess(session.user.id, businessId);
    if (!hasPermission(access.role, 'billing')) {
      return errorResponse('Only business owners can manage billing', 403);
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { subscription: true },
    });

    if (!business?.subscription?.stripeCustomerId) {
      return errorResponse('No subscription found', 404);
    }

    const origin = request.nextUrl.origin;

    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: business.subscription.stripeCustomerId,
      return_url: `${origin}/settings`,
    });

    return successResponse({ url: portalSession.url });
  } catch (error) {
    console.error('Stripe portal error:', error);
    return errorResponse('Failed to create portal session', 500);
  }
}
