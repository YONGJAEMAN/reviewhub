import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import { verifyTotp } from '@/lib/totp';
import { audit, auditContextFromRequest } from '@/services/auditLogService';
import { rateLimitOrResponse } from '@/lib/rateLimit';

/**
 * Disable 2FA. Requires the user to re-prove ownership via EITHER:
 *   - Current TOTP code, OR
 *   - Account password (for users who lost their authenticator app but
 *     still have their backup codes drained).
 *
 * Either path consumes the corresponding factor — backup-code-only disable
 * is intentionally NOT offered here (backup codes are for login, not for
 * disabling 2FA).
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse('Unauthorized', 401);

  const limited = rateLimitOrResponse(request, {
    name: '2fa-disable',
    windowMs: 10 * 60 * 1000,
    max: 10,
  });
  if (limited) return limited;

  const body = await request.json().catch(() => ({}));
  const { totpCode, password } = body as { totpCode?: string; password?: string };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totpSecret: true, totpEnabled: true, password: true },
  });
  if (!user?.totpEnabled) {
    return errorResponse('2FA is not enabled.', 400);
  }

  let verified = false;
  if (totpCode && user.totpSecret && verifyTotp(user.totpSecret, totpCode)) {
    verified = true;
  } else if (password && user.password) {
    verified = await bcrypt.compare(password, user.password);
  }
  if (!verified) {
    return errorResponse('Verification failed. Provide a valid TOTP code or password.', 400);
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      totpEnabled: false,
      totpSecret: null,
      totpBackupCodes: [],
    },
  });

  const ctx = auditContextFromRequest(request);
  await audit({
    actorId: session.user.id,
    action: 'account.2fa_disabled',
    targetType: 'User',
    targetId: session.user.id,
    metadata: { method: totpCode ? 'totp' : 'password' },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });

  return successResponse({ enabled: false });
}
