import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { renderWeeklySummaryEmail } from '@/emails/WeeklySummaryEmail';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Find businesses with weekly summary enabled
    const settings = await prisma.settings.findMany({
      where: { weeklySummary: true },
      include: {
        business: {
          include: { owner: { select: { email: true } } },
        },
      },
    });

    let sent = 0;
    for (const s of settings) {
      const business = s.business;
      const ownerEmail = business.owner.email;

      const reviews = await prisma.review.findMany({
        where: { businessId: business.id, postedAt: { gte: weekAgo } },
        select: { rating: true, sentimentLabel: true, status: true },
      });

      const newCount = reviews.length;
      if (newCount === 0) continue;

      const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / newCount).toFixed(1);
      const positiveCount = reviews.filter((r) => r.sentimentLabel === 'positive').length;
      const positivePct = Math.round((positiveCount / newCount) * 100);
      const unanswered = reviews.filter((r) => r.status !== 'REPLIED').length;

      const html = renderWeeklySummaryEmail({
        businessName: business.name,
        newReviews: newCount,
        avgRating,
        positivePercent: positivePct,
        unanswered,
        dashboardUrl: `${request.nextUrl.origin}/dashboard`,
      });

      try {
        await sendEmail({
          to: ownerEmail,
          subject: `Weekly Review Summary - ${business.name}`,
          html,
        });
        sent++;
      } catch {
        console.error(`Failed to send weekly summary to ${ownerEmail}`);
      }
    }

    return successResponse({ sent });
  } catch (error) {
    console.error('Weekly summary cron error:', error);
    return errorResponse('Cron failed', 500);
  }
}
