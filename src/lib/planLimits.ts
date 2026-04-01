import { prisma } from '@/lib/prisma';
import { PLAN_LIMITS } from '@/lib/stripe';

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getEffectivePlan(subscription: {
  plan: string;
  status: string;
  trialEndsAt: Date | null;
} | null): string {
  if (!subscription) return 'FREE';

  if (subscription.status === 'ACTIVE') return subscription.plan;

  if (subscription.status === 'TRIALING' && subscription.trialEndsAt) {
    if (new Date() < subscription.trialEndsAt) return 'GROWTH';
    return 'FREE';
  }

  return 'FREE';
}

export async function checkPlanLimit(
  businessId: string,
  feature: 'aiReplies' | 'whatsapp',
  userId?: string
): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  plan: string;
}> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { subscription: true },
  });

  const plan = getEffectivePlan(business?.subscription ?? null);
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE;
  const limit = limits[feature];

  if (limit === -1) {
    return { allowed: true, used: 0, limit: -1, plan };
  }

  const month = getCurrentMonth();
  let used = 0;

  if (feature === 'aiReplies' && userId) {
    const usage = await prisma.aiUsage.findUnique({
      where: { userId_type_month: { userId, type: 'suggest_reply', month } },
    });
    used = usage?.count ?? 0;
  } else if (feature === 'whatsapp') {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    used = await prisma.reviewRequest.count({
      where: { businessId, sentAt: { gte: startOfMonth } },
    });
  }

  return {
    allowed: used < limit,
    used,
    limit,
    plan,
  };
}

export async function getSubscriptionInfo(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { subscription: true },
  });

  const sub = business?.subscription;
  if (!sub) {
    return {
      plan: 'FREE',
      status: 'TRIALING' as const,
      trialEndsAt: null,
      trialDaysLeft: 0,
      trialExpired: true,
      currentPeriodEnd: null,
      limits: PLAN_LIMITS.FREE,
    };
  }

  const effectivePlan = getEffectivePlan(sub);
  let trialDaysLeft = 0;
  let trialExpired = false;

  if (sub.status === 'TRIALING' && sub.trialEndsAt) {
    const diff = sub.trialEndsAt.getTime() - Date.now();
    trialDaysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    trialExpired = diff <= 0;
  }

  return {
    plan: effectivePlan,
    status: sub.status,
    trialEndsAt: sub.trialEndsAt?.toISOString() ?? null,
    trialDaysLeft,
    trialExpired: sub.status === 'TRIALING' && trialExpired,
    currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
    limits: PLAN_LIMITS[effectivePlan] ?? PLAN_LIMITS.FREE,
  };
}
