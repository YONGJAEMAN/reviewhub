import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserBusinesses } from '@/lib/business';
import { PLAN_LIMITS } from '@/lib/stripe';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const businesses = await getUserBusinesses(session.user.id);
    return successResponse(businesses);
  } catch {
    return errorResponse('Failed to fetch businesses', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const { name, email } = await request.json();
    if (!name) return errorResponse('Business name is required');

    // Check plan limit: count businesses owned by this user
    const ownedCount = await prisma.userBusiness.count({
      where: { userId: session.user.id, role: 'OWNER' },
    });

    // Get the highest plan among owned businesses
    const ownedBusinesses = await prisma.userBusiness.findMany({
      where: { userId: session.user.id, role: 'OWNER' },
      include: { business: { include: { subscription: true } } },
    });

    let effectivePlan = 'FREE';
    for (const ub of ownedBusinesses) {
      const sub = ub.business.subscription;
      if (sub?.status === 'ACTIVE') {
        const planOrder = ['FREE', 'STARTER', 'GROWTH', 'PRO'];
        if (planOrder.indexOf(sub.plan) > planOrder.indexOf(effectivePlan)) {
          effectivePlan = sub.plan;
        }
      } else if (sub?.status === 'TRIALING' && sub.trialEndsAt && new Date() < sub.trialEndsAt) {
        if (['FREE', 'STARTER'].includes(effectivePlan)) effectivePlan = 'GROWTH';
      }
    }

    const limit = PLAN_LIMITS[effectivePlan]?.businesses ?? 1;
    if (ownedCount >= limit) {
      return errorResponse(
        `Your ${effectivePlan} plan allows up to ${limit} business${limit === 1 ? '' : 'es'}. Upgrade to add more.`,
        403
      );
    }

    const business = await prisma.business.create({
      data: {
        name,
        email: email || null,
        ownerId: session.user.id,
      },
    });

    await prisma.userBusiness.create({
      data: {
        userId: session.user.id,
        businessId: business.id,
        role: 'OWNER',
      },
    });

    await prisma.settings.create({
      data: {
        businessId: business.id,
        reviewAlerts: true,
        weeklySummary: true,
        negativeSentiment: true,
      },
    });

    await prisma.subscription.create({
      data: {
        businessId: business.id,
        stripeCustomerId: `cus_new_${business.id}`,
        plan: 'FREE',
        status: 'TRIALING',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });

    return successResponse({ businessId: business.id, businessName: business.name }, 201);
  } catch (error) {
    console.error('Create business error:', error);
    return errorResponse('Failed to create business', 500);
  }
}
