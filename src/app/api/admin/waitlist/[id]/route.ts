import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createInviteCode } from '@/services/inviteCodeService';
import { sendEmail } from '@/lib/email';
import { successResponse, errorResponse } from '@/lib/api';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const { status } = await request.json();

    const entry = await prisma.waitlist.update({
      where: { id },
      data: { status },
    });

    // If approved, generate invite code and send email
    if (status === 'APPROVED' && entry.email) {
      const [code] = await createInviteCode(1);
      try {
        await sendEmail({
          to: entry.email,
          subject: 'ReviewHub 초대 코드가 도착했습니다!',
          html: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
              <h1 style="color: #1B3A4B; font-size: 24px;">ReviewHub에 초대합니다!</h1>
              <p style="color: #718096;">아래 초대 코드를 사용하여 가입하세요:</p>
              <div style="background: #F8F9FA; border: 2px solid #2E86C1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="font-size: 28px; font-weight: bold; font-family: monospace; color: #1B3A4B;">${code.code}</span>
              </div>
              <a href="${process.env.NEXTAUTH_URL}/signup" style="display: inline-block; background: #1B3A4B; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">가입하러 가기</a>
            </div>
          `,
        });
      } catch {
        // Email may fail
      }
    }

    return successResponse(entry);
  } catch {
    return errorResponse('Failed to update waitlist entry', 500);
  }
}
