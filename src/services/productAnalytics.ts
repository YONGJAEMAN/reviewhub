import { prisma } from '@/lib/prisma';
import { captureError } from '@/lib/observability';

/**
 * Provider-neutral product analytics (funnels, activation events).
 *
 * Separate from `analyticsService.ts` which handles review sentiment/rating
 * analytics for the customer-facing dashboard. This one is for our own
 * funnels.
 *
 * Writes to AnalyticsEvent so we can build funnels (onboarding, activation,
 * conversion) without committing to a vendor up front. When we add PostHog
 * or Mixpanel later, we can either:
 *   - Switch this helper to dual-write
 *   - Run a one-time backfill from this table
 *
 * Never throws — analytics is best-effort and must not break a user request.
 *
 * Conventions:
 *   - Event names use dotted snake_case ("onboarding.step_completed").
 *   - Properties are small, scalar values. No PII beyond what's required to
 *     join (userId/businessId are FK-like strings, not emails/names).
 */
export interface TrackEventInput {
  name: string;
  userId?: string | null;
  businessId?: string | null;
  sessionId?: string | null;
  properties?: Record<string, unknown> | null;
}

export async function trackEvent(input: TrackEventInput): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        name: input.name,
        userId: input.userId ?? null,
        businessId: input.businessId ?? null,
        sessionId: input.sessionId ?? null,
        properties: input.properties
          ? JSON.parse(JSON.stringify(input.properties))
          : null,
      },
    });
  } catch (err) {
    captureError(err, { tag: 'product-analytics', extra: { event: input.name } });
  }
}

const ONBOARDING_STEPS = [
  'onboarding.started',
  'onboarding.business_named',
  'onboarding.platform_connected',
  'onboarding.first_review_seen',
  'onboarding.completed',
] as const;

/**
 * Compute a simple onboarding-funnel snapshot for a date range.
 * Returns distinct user count per canonical step, in order.
 */
export async function getOnboardingFunnel(opts: {
  from: Date;
  to: Date;
}): Promise<Array<{ step: string; users: number }>> {
  const result: Array<{ step: string; users: number }> = [];
  for (const step of ONBOARDING_STEPS) {
    const rows = await prisma.analyticsEvent.findMany({
      where: {
        name: step,
        createdAt: { gte: opts.from, lte: opts.to },
        userId: { not: null },
      },
      select: { userId: true },
      distinct: ['userId'],
    });
    result.push({ step, users: rows.length });
  }
  return result;
}

export const ANALYTICS_EVENTS = {
  ONBOARDING_STARTED: 'onboarding.started',
  ONBOARDING_BUSINESS_NAMED: 'onboarding.business_named',
  ONBOARDING_PLATFORM_CONNECTED: 'onboarding.platform_connected',
  ONBOARDING_FIRST_REVIEW_SEEN: 'onboarding.first_review_seen',
  ONBOARDING_COMPLETED: 'onboarding.completed',
  PRICING_VIEWED: 'pricing.viewed',
  CHECKOUT_STARTED: 'checkout.started',
  AI_REPLY_GENERATED: 'ai.reply_generated',
} as const;
