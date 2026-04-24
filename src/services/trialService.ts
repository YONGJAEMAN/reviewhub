import { prisma } from '@/lib/prisma';
import { createNotification } from '@/services/notificationService';

/**
 * Find Subscription rows whose trial has elapsed without a paid sub being
 * created, and transition them to CANCELED + plan=FREE.
 *
 * This is a DB-state cleanup pass — the request-time `getEffectivePlan()`
 * in planLimits.ts already returns FREE once `trialEndsAt < now`, so
 * feature limits are enforced regardless. This cron keeps analytics/filters
 * correct and avoids a "stuck in TRIALING forever" appearance.
 *
 * Safe to run repeatedly — only picks rows that still match the criteria.
 */
export async function expireStaleTrials(): Promise<{
  processed: number;
  errors: Array<{ subscriptionId: string; message: string }>;
}> {
  const now = new Date();

  const stale = await prisma.subscription.findMany({
    where: {
      status: 'TRIALING',
      trialEndsAt: { lt: now },
      stripeSubscriptionId: null, // they never converted to a paid plan
    },
    include: {
      business: { select: { id: true, name: true } },
    },
  });

  let processed = 0;
  const errors: Array<{ subscriptionId: string; message: string }> = [];

  for (const sub of stale) {
    try {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: 'CANCELED', plan: 'FREE' },
      });

      // Best-effort in-app notification so owners know why limits tightened.
      try {
        await createNotification({
          type: 'PLAN_LIMIT',
          title: 'Trial expired',
          message: `Your 14-day trial for "${sub.business.name}" has ended. You're now on the FREE plan.`,
          actionUrl: '/pricing',
          businessId: sub.business.id,
        });
      } catch {
        // Notification failure is non-critical.
      }

      processed++;
    } catch (err) {
      errors.push({
        subscriptionId: sub.id,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { processed, errors };
}
