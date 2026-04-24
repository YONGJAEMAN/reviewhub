import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getStripe, getPlanFromPriceAmount } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { requireEnv } from '@/lib/env';
import { captureError } from '@/lib/observability';
import type Stripe from 'stripe';

interface StripeSubscription {
  id: string;
  status: string;
  current_period_end: number;
  items: { data: Array<{ price?: { unit_amount?: number | null } }> };
}

// Explicit Stripe → internal status mapping. Unknown statuses are left
// unchanged (we return "no-op" rather than silently coercing to ACTIVE).
const STATUS_MAP: Record<string, 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING'> = {
  active: 'ACTIVE',
  trialing: 'TRIALING',
  past_due: 'PAST_DUE',
  unpaid: 'PAST_DUE',
  canceled: 'CANCELED',
  incomplete: 'PAST_DUE',
  incomplete_expired: 'CANCELED',
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      requireEnv('STRIPE_WEBHOOK_SECRET'),
    );
  } catch (err) {
    // Signature failure: don't log to Sentry (noise from bad actors).
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    const obj = event.data.object as unknown as Record<string, unknown>;

    switch (event.type) {
      case 'checkout.session.completed': {
        const businessId = (obj.metadata as Record<string, string> | undefined)?.businessId;
        const plan = (obj.metadata as Record<string, string> | undefined)?.plan;
        const customer = obj.customer as string | undefined;
        const subscription = obj.subscription as string | undefined;

        if (businessId && customer && subscription) {
          await prisma.subscription.upsert({
            where: { businessId },
            update: {
              stripeCustomerId: customer,
              stripeSubscriptionId: subscription,
              plan: (plan as 'STARTER' | 'GROWTH' | 'PRO') ?? 'STARTER',
              status: 'ACTIVE',
            },
            create: {
              businessId,
              stripeCustomerId: customer,
              stripeSubscriptionId: subscription,
              plan: (plan as 'STARTER' | 'GROWTH' | 'PRO') ?? 'STARTER',
              status: 'ACTIVE',
            },
          });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const subId = obj.subscription as string | undefined;
        if (subId) {
          const sub = await getStripe().subscriptions.retrieve(subId) as unknown as StripeSubscription;
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subId },
            data: {
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
              status: 'ACTIVE',
            },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const subId = obj.subscription as string | undefined;
        if (subId) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subId },
            data: { status: 'PAST_DUE' },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subId = obj.id as string;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subId },
          data: { status: 'CANCELED', plan: 'FREE' },
        });
        break;
      }

      case 'customer.subscription.updated': {
        const sub = obj as unknown as StripeSubscription;
        const priceAmount = sub.items.data[0]?.price?.unit_amount ?? 0;
        const plan = getPlanFromPriceAmount(priceAmount);
        const mapped = STATUS_MAP[sub.status];
        if (!mapped) {
          // Unknown status — log and skip rather than coerce to ACTIVE.
          captureError(new Error(`Unknown Stripe subscription status: ${sub.status}`), {
            tag: 'stripe:webhook',
            extra: { eventType: event.type, subId: sub.id, status: sub.status },
          });
          break;
        }

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            plan: plan as 'STARTER' | 'GROWTH' | 'PRO',
            status: mapped,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
        break;
      }
    }
  } catch (error) {
    // Return 500 so Stripe retries. Most handlers use upsert/updateMany with
    // where clauses, so retries are idempotent. Still log to Sentry.
    captureError(error, {
      tag: 'stripe:webhook',
      extra: { eventType: event.type, eventId: event.id },
    });
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
