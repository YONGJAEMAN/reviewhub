import { prisma } from '@/lib/prisma';
import { createInviteCode } from '@/services/inviteCodeService';
import { sendEmail } from '@/lib/email';
import { successResponse, errorResponse } from '@/lib/api';
import { requireAdmin } from '@/lib/adminAuth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireAdmin();
    if (guard) return guard;

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
          subject: 'Your ReviewHub Invite Code Has Arrived!',
          html: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
              <h1 style="color: #1B3A4B; font-size: 24px;">You're Invited to ReviewHub!</h1>
              <p style="color: #718096;">Use the invite code below to sign up:</p>
              <div style="background: #F8F9FA; border: 2px solid #2E86C1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="font-size: 28px; font-weight: bold; font-family: monospace; color: #1B3A4B;">${code.code}</span>
              </div>
              <a href="${process.env.NEXTAUTH_URL}/signup" style="display: inline-block; background: #1B3A4B; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Sign Up Now</a>
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
