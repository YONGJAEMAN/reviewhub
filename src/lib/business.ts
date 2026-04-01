import { prisma } from '@/lib/prisma';
import type { BusinessRole } from '@/generated/prisma/client';

export interface UserBusinessInfo {
  businessId: string;
  businessName: string;
  role: BusinessRole;
  plan: string;
}

export async function getUserBusinesses(userId: string): Promise<UserBusinessInfo[]> {
  const memberships = await prisma.userBusiness.findMany({
    where: { userId },
    include: {
      business: {
        include: { subscription: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return memberships.map((m) => ({
    businessId: m.businessId,
    businessName: m.business.name,
    role: m.role,
    plan: m.business.subscription?.plan ?? 'FREE',
  }));
}

export async function verifyBusinessAccess(
  userId: string,
  businessId: string
): Promise<{ allowed: boolean; role: BusinessRole | null }> {
  const membership = await prisma.userBusiness.findUnique({
    where: { userId_businessId: { userId, businessId } },
  });
  return {
    allowed: !!membership,
    role: membership?.role ?? null,
  };
}

export function hasPermission(
  role: BusinessRole | null,
  action: 'read' | 'write' | 'billing' | 'manage_team'
): boolean {
  if (!role) return false;
  switch (action) {
    case 'read':
      return true;
    case 'write':
      return role === 'OWNER' || role === 'ADMIN';
    case 'billing':
      return role === 'OWNER';
    case 'manage_team':
      return role === 'OWNER';
    default:
      return false;
  }
}

export async function getActiveBusinessId(
  userId: string,
  requestBusinessId?: string | null
): Promise<string | null> {
  if (requestBusinessId) {
    const access = await verifyBusinessAccess(userId, requestBusinessId);
    return access.allowed ? requestBusinessId : null;
  }

  const first = await prisma.userBusiness.findFirst({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
  return first?.businessId ?? null;
}
