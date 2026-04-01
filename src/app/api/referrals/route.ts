import { auth } from '@/lib/auth';
import { ensureReferralCode, getReferralStats } from '@/services/referralService';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const code = await ensureReferralCode(session.user.id);
    const stats = await getReferralStats(session.user.id);
    const baseUrl = process.env.NEXTAUTH_URL || 'https://reviewhub.app';

    return successResponse({
      code,
      link: `${baseUrl}/ref/${code}`,
      ...stats,
    });
  } catch {
    return errorResponse('Failed to fetch referral data', 500);
  }
}
