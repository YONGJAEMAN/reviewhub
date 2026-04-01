import { prisma } from '@/lib/prisma';
import type { NotificationType } from '@/generated/prisma/client';
import { sendEmail } from '@/lib/email';
import { renderReviewAlertEmail } from '@/emails/ReviewAlertEmail';
import { renderNegativeAlertEmail } from '@/emails/NegativeAlertEmail';

export async function createNotification(data: {
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  businessId: string;
}) {
  return prisma.notification.create({ data });
}

export async function getNotificationsForBusiness(
  businessId: string,
  options?: { unreadOnly?: boolean; limit?: number }
) {
  return prisma.notification.findMany({
    where: {
      businessId,
      ...(options?.unreadOnly ? { isRead: false } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: options?.limit ?? 20,
  });
}

export async function getUnreadCount(businessId: string): Promise<number> {
  return prisma.notification.count({
    where: { businessId, isRead: false },
  });
}

export async function markAsRead(id: string) {
  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
}

export async function markAllAsRead(businessId: string) {
  return prisma.notification.updateMany({
    where: { businessId, isRead: false },
    data: { isRead: true },
  });
}

/**
 * Handle notifications + email for a newly synced review.
 * Call this after upserting a review when sentimentScore was null (new review).
 */
export async function notifyNewReview(params: {
  businessId: string;
  businessName: string;
  reviewerName: string;
  rating: number;
  content: string;
  reviewId: string;
  dashboardOrigin?: string;
}) {
  const { businessId, businessName, reviewerName, rating, content, reviewId } = params;
  const reviewUrl = `${params.dashboardOrigin ?? ''}/reviews?highlight=${reviewId}`;

  // In-app notification
  await createNotification({
    type: 'NEW_REVIEW',
    title: `New ${rating}-star review`,
    message: `${reviewerName} left a ${rating}-star review for ${businessName}`,
    actionUrl: reviewUrl,
    businessId,
  });

  // Load settings for email preferences
  const settings = await prisma.settings.findUnique({ where: { businessId } });
  const ownerEmail = await prisma.business
    .findUnique({ where: { id: businessId }, include: { owner: { select: { email: true } } } })
    .then((b) => b?.owner.email);

  if (!ownerEmail) return;

  // Negative review alert
  if (rating <= 2) {
    await createNotification({
      type: 'NEGATIVE_REVIEW',
      title: 'Negative review alert',
      message: `${reviewerName} left a ${rating}-star review requiring attention`,
      actionUrl: reviewUrl,
      businessId,
    });

    if (settings?.negativeSentiment) {
      try {
        const html = renderNegativeAlertEmail({ businessName, reviewerName, rating, content, reviewUrl });
        await sendEmail({ to: ownerEmail, subject: `⚠ Negative Review - ${businessName}`, html });
      } catch { /* email send failure is non-critical */ }
    }
  } else if (settings?.reviewAlerts) {
    // Standard review email alert (non-negative)
    try {
      const html = renderReviewAlertEmail({ businessName, reviewerName, rating, content, reviewUrl });
      await sendEmail({ to: ownerEmail, subject: `New Review - ${businessName}`, html });
    } catch { /* email send failure is non-critical */ }
  }
}
