import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/api';
import { audit, auditContextFromRequest } from '@/services/auditLogService';
import { rateLimitOrResponse } from '@/lib/rateLimit';

/**
 * GDPR data-portability export.
 *
 * Returns a JSON dump of everything we hold about the authenticated user
 * (profile, businesses they own/access, reviews their businesses received,
 * subscription history, audit trail of their actions, email logs).
 *
 * Rate-limited (1/min/user) — the query touches many tables and we don't
 * want hot-loop abuse.
 *
 * What we DON'T include (deliberate):
 *   - Other users' data they're a member of (their email/names belong to them)
 *   - Hashed passwords (no value, leak risk)
 *   - Internal IDs from third-party providers
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse('Unauthorized', 401);

  const limited = rateLimitOrResponse(request, {
    name: 'account-export',
    windowMs: 60 * 1000,
    max: 1,
  });
  if (limited) return limited;

  const userId = session.user.id;

  const [
    user,
    ownedBusinesses,
    memberOf,
    reviews,
    subscriptions,
    auditLogs,
    emailLogs,
    referrals,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        onboardingCompleted: true,
        marketingOptOut: true,
        referralCode: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.business.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    }),
    prisma.userBusiness.findMany({
      where: { userId },
      select: {
        businessId: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.review.findMany({
      where: { business: { ownerId: userId } },
      select: {
        id: true,
        platform: true,
        rating: true,
        content: true,
        postedAt: true,
        businessId: true,
      },
    }),
    prisma.subscription.findMany({
      where: { business: { ownerId: userId } },
      select: {
        plan: true,
        status: true,
        trialEndsAt: true,
        currentPeriodEnd: true,
        businessId: true,
        createdAt: true,
      },
    }),
    prisma.auditLog.findMany({
      where: { actorId: userId },
      select: {
        action: true,
        targetType: true,
        targetId: true,
        metadata: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    }),
    prisma.emailLog.findMany({
      where: { userId },
      select: { templateKey: true, sentAt: true },
    }),
    prisma.referral.findMany({
      where: { referrerId: userId },
      select: { code: true, status: true, createdAt: true },
    }),
  ]);

  const ctx = auditContextFromRequest(request);
  await audit({
    actorId: userId,
    action: 'account.data_exported',
    targetType: 'User',
    targetId: userId,
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });

  const payload = {
    exportedAt: new Date().toISOString(),
    user,
    businesses: { owned: ownedBusinesses, memberOf },
    reviews,
    subscriptions,
    emailLogs,
    referrals,
    auditLogs,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="reviewhub-export-${userId}.json"`,
    },
  });
}
