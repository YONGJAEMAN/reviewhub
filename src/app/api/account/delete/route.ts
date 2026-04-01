import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';
import { successResponse, errorResponse } from '@/lib/api';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const { password } = await request.json();
    if (!password) return errorResponse('Password is required');

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        businesses: {
          include: { subscription: true },
        },
      },
    });

    if (!user || !user.password) {
      return errorResponse('Cannot delete OAuth-only account this way. Contact support.');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return errorResponse('Incorrect password');

    const existing = await prisma.accountDeletion.findUnique({
      where: { userId: user.id },
    });
    if (existing && existing.status === 'PENDING') {
      return errorResponse('Account deletion already requested');
    }

    // Cancel active Stripe subscriptions
    for (const business of user.businesses) {
      const sub = business.subscription;
      if (sub?.stripeSubscriptionId && !sub.stripeSubscriptionId.startsWith('cus_local_')) {
        try {
          await getStripe().subscriptions.cancel(sub.stripeSubscriptionId);
        } catch {
          // Stripe may fail if subscription already cancelled
        }
      }
    }

    // Schedule deletion 30 days from now
    await prisma.accountDeletion.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        scheduledAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      update: {
        status: 'PENDING',
        scheduledAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelledAt: null,
        completedAt: null,
      },
    });

    return successResponse({ message: 'Account deletion scheduled' });
  } catch {
    return errorResponse('Failed to process account deletion', 500);
  }
}
