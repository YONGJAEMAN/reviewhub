import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

export function generateCode(): string {
  return `BETA-${nanoid(6).toUpperCase()}`;
}

export async function createInviteCode(count = 1) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = await prisma.inviteCode.create({
      data: { code: generateCode() },
    });
    codes.push(code);
  }
  return codes;
}

export async function validateInviteCode(code: string) {
  const invite = await prisma.inviteCode.findUnique({ where: { code } });
  if (!invite) return { valid: false, error: 'Invalid invite code' };
  if (invite.useCount >= invite.maxUses) return { valid: false, error: 'Invite code already used' };
  if (invite.expiresAt && invite.expiresAt < new Date()) return { valid: false, error: 'Invite code expired' };
  return { valid: true, invite };
}

export async function redeemInviteCode(code: string, userId: string) {
  await prisma.inviteCode.update({
    where: { code },
    data: {
      usedBy: userId,
      usedAt: new Date(),
      useCount: { increment: 1 },
    },
  });
}

export async function listInviteCodes() {
  return prisma.inviteCode.findMany({
    orderBy: { createdAt: 'desc' },
  });
}
