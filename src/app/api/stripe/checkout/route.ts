import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getStripe, PLANS } from '@/lib/stripe';
import { getActiveBusinessId, verifyBusinessAccess, hasPermission } from '@/lib/business';
import { successResponse, errorResponse } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const { plan, interval, businessId: reqBusinessId } = await request.json();

    if (!plan || !PLANS[plan]) {
      return errorResponse('Invalid plan', 400);
    }

    const businessId = await getActiveBusinessId(session.user.id, reqBusinessId);
    if (!businessId) return errorResponse('Business not found', 404);

    // Only OWNER can manage billing
    const access = await verifyBusinessAccess(session.user.id, businessId);
    if (!hasPermission(access.role, 'billing')) {
      return errorResponse('Only business owners can manage billing', 403);
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { subscription: true },
    });
    if (!business) return errorResponse('Business not found', 404);

    let stripeCustomerId = business.subscription?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await getStripe().customers.create({
        email: session.user.email ?? undefined,
        metadata: { businessId: business.id, userId: session.user.id },
      });
      stripeCustomerId = customer.id;
    }

    const planConfig = PLANS[plan];
    const unitAmount = interval === 'yearly' ? planConfig.yearlyPrice : planConfig.monthlyPrice;
    const recurringInterval = interval === 'yearly' ? 'year' : 'month';

    const origin = request.nextUrl.origin;

    const checkoutSession = await getStripe().checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `ReviewHub ${planConfig.name}` },
            unit_amount: unitAmount,
            recurring: { interval: recurringInterval },
          },
          quantity: 1,
        },
      ],
      metadata: { businessId: business.id, plan },
      success_url: `${origin}/settings?payment=success`,
      cancel_url: `${origin}/pricing?canceled=true`,
    });

    return successResponse({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return errorResponse('Failed to create checkout session', 500);
  }
}
