import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyBusinessAccess, hasPermission } from '@/lib/business';
import { successResponse, errorResponse } from '@/lib/api';
import { audit, auditContextFromRequest } from '@/services/auditLogService';
import { sendEmail } from '@/lib/email';
import { hasEnv } from '@/lib/env';
import type { BusinessRole } from '@/generated/prisma/client';

function teamInviteEmail(params: {
  inviterName: string;
  businessName: string;
  role: string;
  dashboardUrl: string;
}): string {
  const { inviterName, businessName, role, dashboardUrl } = params;
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <h1 style="color: #0F1B2D; font-size: 22px;">You've been invited to ${businessName}</h1>
      <p style="color: #4B5563; line-height: 1.6;">
        ${inviterName} added you as a <strong>${role}</strong> on ReviewHub.
      </p>
      <p style="margin-top: 24px;">
        <a href="${dashboardUrl}" style="display: inline-block; background: #0F1B2D; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Open dashboard</a>
      </p>
      <p style="color: #9CA3AF; font-size: 13px; margin-top: 24px;">
        You won't see this business until you sign in with this email address.
      </p>
    </div>
  `;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const { id: businessId } = await params;
    const access = await verifyBusinessAccess(session.user.id, businessId);
    if (!access.allowed) return errorResponse('Access denied', 403);

    const members = await prisma.userBusiness.findMany({
      where: { businessId },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return successResponse(
      members.map((m) => ({
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
        image: m.user.image,
        role: m.role,
        joinedAt: m.createdAt.toISOString(),
      }))
    );
  } catch {
    return errorResponse('Failed to fetch members', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const { id: businessId } = await params;
    const access = await verifyBusinessAccess(session.user.id, businessId);
    if (!hasPermission(access.role, 'manage_team')) {
      return errorResponse('Only owners can manage team members', 403);
    }

    const { email, role } = await request.json();
    if (!email) return errorResponse('Email is required');

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return errorResponse('No user found with this email. They must sign up first.', 404);

    const existing = await prisma.userBusiness.findUnique({
      where: { userId_businessId: { userId: user.id, businessId } },
    });
    if (existing) return errorResponse('This user is already a member');

    const finalRole = (role as BusinessRole) || 'VIEWER';
    await prisma.userBusiness.create({
      data: {
        userId: user.id,
        businessId,
        role: finalRole,
      },
    });

    // Best-effort invite email + audit log. Both swallow failures so they
    // can't block the membership creation.
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { name: true },
    });
    const inviter = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    });

    if (hasEnv('RESEND_API_KEY') && business) {
      try {
        await sendEmail({
          to: user.email!,
          subject: `${inviter?.name ?? 'A teammate'} invited you to ${business.name} on ReviewHub`,
          html: teamInviteEmail({
            inviterName: inviter?.name ?? inviter?.email ?? 'A teammate',
            businessName: business.name,
            role: finalRole,
            dashboardUrl: `${process.env.NEXTAUTH_URL ?? ''}/dashboard`,
          }),
        });
      } catch {
        // Email infra issue shouldn't block membership.
      }
    }

    const ctx = auditContextFromRequest(request);
    await audit({
      actorId: session.user.id,
      action: 'team.member_added',
      businessId,
      targetType: 'User',
      targetId: user.id,
      metadata: { email: user.email, role: finalRole },
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return successResponse({ userId: user.id, email: user.email, role: finalRole }, 201);
  } catch {
    return errorResponse('Failed to add member', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const { id: businessId } = await params;
    const access = await verifyBusinessAccess(session.user.id, businessId);
    if (!hasPermission(access.role, 'manage_team')) {
      return errorResponse('Only owners can manage team members', 403);
    }

    const { userId } = await request.json();
    if (!userId) return errorResponse('userId is required');
    if (userId === session.user.id) return errorResponse('Cannot remove yourself');

    await prisma.userBusiness.delete({
      where: { userId_businessId: { userId, businessId } },
    });

    const ctx = auditContextFromRequest(request);
    await audit({
      actorId: session.user.id,
      action: 'team.member_removed',
      businessId,
      targetType: 'User',
      targetId: userId,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return successResponse({ removed: true });
  } catch {
    return errorResponse('Failed to remove member', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const { id: businessId } = await params;
    const access = await verifyBusinessAccess(session.user.id, businessId);
    if (!hasPermission(access.role, 'manage_team')) {
      return errorResponse('Only owners can manage team members', 403);
    }

    const { userId, role } = await request.json();
    if (!userId || !role) return errorResponse('userId and role are required');
    if (role === 'OWNER') return errorResponse('Cannot assign OWNER role');

    await prisma.userBusiness.update({
      where: { userId_businessId: { userId, businessId } },
      data: { role: role as BusinessRole },
    });

    const ctx = auditContextFromRequest(request);
    await audit({
      actorId: session.user.id,
      action: 'team.role_changed',
      businessId,
      targetType: 'User',
      targetId: userId,
      metadata: { role },
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return successResponse({ userId, role });
  } catch {
    return errorResponse('Failed to update role', 500);
  }
}
