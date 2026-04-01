import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

export function generateReferralCode(): string {
  return `REF-${nanoid(4).toUpperCase()}`;
}

export async function ensureReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });

  if (user?.referralCode) return user.referralCode;

  let code: string;
  let attempts = 0;
  do {
    code = generateReferralCode();
    attempts++;
  } while (
    (await prisma.user.findUnique({ where: { referralCode: code } })) &&
    attempts < 5
  );

  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: code },
  });

  return code;
}

export async function getReferralStats(userId: string) {
  const referrals = await prisma.referral.findMany({
    where: { referrerId: userId },
    include: {
      referred: { select: { name: true, createdAt: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    total: referrals.length,
    pending: referrals.filter((r) => r.status === 'PENDING').length,
    completed: referrals.filter((r) => r.status === 'COMPLETED').length,
    rewarded: referrals.filter((r) => r.status === 'REWARDED').length,
    referrals,
  };
}
