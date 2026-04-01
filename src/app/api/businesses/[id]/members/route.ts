import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyBusinessAccess, hasPermission } from '@/lib/business';
import { successResponse, errorResponse } from '@/lib/api';
import type { BusinessRole } from '@/generated/prisma/client';

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

    await prisma.userBusiness.create({
      data: {
        userId: user.id,
        businessId,
        role: (role as BusinessRole) || 'VIEWER',
      },
    });

    return successResponse({ userId: user.id, email: user.email, role: role || 'VIEWER' }, 201);
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

    return successResponse({ userId, role });
  } catch {
    return errorResponse('Failed to update role', 500);
  }
}
