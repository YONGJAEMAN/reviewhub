import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getReportData } from '@/services/reportService';
import { generateCSV } from '@/lib/csvExport';
import { sendEmail } from '@/lib/email';
import { verifyCronAuth } from '@/lib/cronAuth';
import { captureError } from '@/lib/observability';

export async function GET(request: Request) {
  const authGuard = verifyCronAuth(request);
  if (authGuard) return authGuard;

  try {
    // Find businesses with autoMonthlyReport enabled
    const settings = await prisma.settings.findMany({
      where: { autoMonthlyReport: true },
      include: {
        business: {
          include: { owner: { select: { email: true, name: true } } },
        },
      },
    });

    let sent = 0;

    for (const s of settings) {
      try {
        const data = await getReportData(s.businessId, 30);
        const csv = generateCSV(data);

        // Send email with CSV summary in body (attachments would require Resend pro)
        const summaryHtml = `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0F1B2D;">Monthly Report - ${s.business.name}</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">Total Reviews</td><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${data.kpi.totalReviews}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">Avg Rating</td><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${data.kpi.avgRating}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">Positive Sentiment</td><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${data.kpi.positivePercent}%</td></tr>
              <tr><td style="padding: 8px;">Response Rate</td><td style="padding: 8px; font-weight: bold;">${data.kpi.responseRate}%</td></tr>
            </table>
            <p style="color: #6B7280; font-size: 14px;">Log in to your dashboard for the full report and PDF/CSV export.</p>
            <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; background: #0F1B2D; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; margin-top: 8px;">View Dashboard</a>
          </div>
        `;

        await sendEmail({
          to: s.business.owner.email,
          subject: `[ReviewHub] ${s.business.name} - Monthly Review Report`,
          html: summaryHtml,
        });

        sent++;
      } catch (err) {
        captureError(err, {
          tag: 'cron:monthly-report',
          extra: { businessId: s.businessId },
        });
      }
    }

    return NextResponse.json({ sent, total: settings.length });
  } catch (error) {
    captureError(error, { tag: 'cron:monthly-report' });
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
