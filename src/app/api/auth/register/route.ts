import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';
import { features } from '@/lib/features';
import { validateInviteCode, redeemInviteCode } from '@/services/inviteCodeService';
import { generateReferralCode } from '@/services/referralService';
import { successResponse, errorResponse } from '@/lib/api';
import { rateLimitOrResponse } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimitOrResponse(request, {
      name: 'register',
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10,
    });
    if (limited) return limited;

    const { name, email, password, inviteCode } = await request.json();

    if (!email || !password) {
      return errorResponse('Email and password are required');
    }

    // Validate invite code if beta mode is enabled
    if (features.betaInviteRequired) {
      if (!inviteCode) return errorResponse('Invite code is required');
      const validation = await validateInviteCode(inviteCode);
      if (!validation.valid) return errorResponse(validation.error!);
    }

    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters');
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return errorResponse('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
        referralCode: generateReferralCode(),
      },
    });

    // Create default business
    const business = await prisma.business.create({
      data: {
        name: name ? `${name}'s Business` : 'My Business',
        email,
        ownerId: user.id,
      },
    });

    // Create UserBusiness junction (multi-tenancy)
    await prisma.userBusiness.create({
      data: {
        userId: user.id,
        businessId: business.id,
        role: 'OWNER',
      },
    });

    // Create Stripe customer
    let stripeCustomerId = '';
    try {
      const customer = await getStripe().customers.create({
        email,
        name: name || undefined,
        metadata: { businessId: business.id, userId: user.id },
      });
      stripeCustomerId = customer.id;
    } catch {
      // Stripe may not be configured in dev; use placeholder
      stripeCustomerId = `cus_local_${user.id}`;
    }

    // Create subscription with 14-day trial
    await prisma.subscription.create({
      data: {
        businessId: business.id,
        stripeCustomerId,
        plan: 'FREE',
        status: 'TRIALING',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });

    // Create default settings
    await prisma.settings.create({
      data: {
        businessId: business.id,
        reviewAlerts: true,
        weeklySummary: true,
        negativeSentiment: true,
      },
    });

    // Redeem invite code if beta mode
    if (features.betaInviteRequired && inviteCode) {
      await redeemInviteCode(inviteCode, user.id);
    }

    // Check referral cookie
    const refCode = request.cookies.get('ref')?.value;
    if (refCode) {
      try {
        const referrer = await prisma.user.findUnique({
          where: { referralCode: refCode },
          select: { id: true },
        });
        if (referrer && referrer.id !== user.id) {
          await prisma.referral.create({
            data: {
              code: refCode,
              referrerId: referrer.id,
              referredId: user.id,
            },
          });
        }
      } catch {}
    }

    // Send welcome email (non-blocking)
    try {
      const { renderWelcomeEmail } = await import('@/emails/WelcomeEmail');
      const { getUnsubscribeUrl } = await import('@/lib/unsubscribe');
      const { sendEmail } = await import('@/lib/email');
      const html = renderWelcomeEmail({
        userName: name || 'there',
        unsubscribeUrl: getUnsubscribeUrl(user.id),
      });
      await sendEmail({ to: email, subject: 'Welcome to ReviewHub!', html });
      await prisma.emailLog.create({
        data: { userId: user.id, templateKey: 'welcome' },
      });
    } catch {}

    return successResponse(
      { id: user.id, name: user.name, email: user.email },
      201
    );
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse('Failed to create account', 500);
  }
}
