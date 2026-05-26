import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import { generateTotpSecret, buildOtpauthUri } from '@/lib/totp';
import { rateLimitOrResponse } from '@/lib/rateLimit';
import QRCode from 'qrcode';

/**
 * Start 2FA setup — generates a fresh secret + QR code data URL.
 *
 * Behavior:
 *   - Idempotent: calling multiple times rotates the secret (last one wins).
 *     This lets a user re-scan if their authenticator app got reset.
 *   - We persist the secret immediately but leave totpEnabled=false. Until
 *     /enable verifies a real code, the secret is "pending" and the user's
 *     account is unaffected.
 *   - Rate-limited to prevent QR-storm abuse.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse('Unauthorized', 401);

  const limited = rateLimitOrResponse(request, {
    name: '2fa-setup',
    windowMs: 10 * 60 * 1000,
    max: 5,
  });
  if (limited) return limited;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, totpEnabled: true },
  });
  if (!user) return errorResponse('User not found', 404);
  if (user.totpEnabled) {
    return errorResponse('2FA already enabled. Disable it first to re-setup.', 400);
  }

  const secret = generateTotpSecret();
  const uri = buildOtpauthUri({
    secret,
    accountName: user.email,
    issuer: 'ReviewHub',
  });
  const qrDataUrl = await QRCode.toDataURL(uri, { width: 240, margin: 1 });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { totpSecret: secret },
  });

  return successResponse({
    qrCode: qrDataUrl,
    secret, // shown as fallback for manual entry; do NOT log
    otpauthUri: uri,
  });
}
