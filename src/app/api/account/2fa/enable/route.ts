import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import { verifyTotp, generateBackupCodes } from '@/lib/totp';
import { audit, auditContextFromRequest } from '@/services/auditLogService';
import { rateLimitOrResponse } from '@/lib/rateLimit';

/**
 * Activate 2FA — verifies the user's first TOTP code against the pending
 * secret. On success: totpEnabled=true, returns one-time backup codes.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse('Unauthorized', 401);

  const limited = rateLimitOrResponse(request, {
    name: '2fa-enable',
    windowMs: 10 * 60 * 1000,
    max: 10,
  });
  if (limited) return limited;

  const { code } = await request.json().catch(() => ({}));
  if (!code || typeof code !== 'string') {
    return errorResponse('Code is required');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totpSecret: true, totpEnabled: true },
  });
  if (!user?.totpSecret) {
    return errorResponse('No pending setup. Call /setup first.', 400);
  }
  if (user.totpEnabled) {
    return errorResponse('2FA already enabled.', 400);
  }
  if (!verifyTotp(user.totpSecret, code)) {
    return errorResponse('Invalid code. Try again.', 400);
  }

  const plainBackupCodes = generateBackupCodes(10);
  const hashed = await Promise.all(plainBackupCodes.map((c) => bcrypt.hash(c, 10)));

  await prisma.user.update({
    where: { id: session.user.id },
    data: { totpEnabled: true, totpBackupCodes: hashed },
  });

  const ctx = auditContextFromRequest(request);
  await audit({
    actorId: session.user.id,
    action: 'account.2fa_enabled',
    targetType: 'User',
    targetId: session.user.id,
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });

  return successResponse({
    enabled: true,
    backupCodes: plainBackupCodes, // ONE-TIME — never shown again
  });
}
