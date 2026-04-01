import { prisma } from '@/lib/prisma';
import type { NotificationSetting } from '@/types';

export interface BusinessProfile {
  name: string;
  email: string;
  description: string;
}

export async function getProfile(businessId: string): Promise<BusinessProfile> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });

  if (!business) {
    return { name: '', email: '', description: '' };
  }

  return {
    name: business.name,
    email: business.email ?? '',
    description: business.description ?? '',
  };
}

export async function updateProfile(
  profile: Partial<BusinessProfile>,
  businessId: string
): Promise<BusinessProfile> {
  const updated = await prisma.business.update({
    where: { id: businessId },
    data: {
      name: profile.name,
      email: profile.email,
      description: profile.description,
    },
  });

  return {
    name: updated.name,
    email: updated.email ?? '',
    description: updated.description ?? '',
  };
}

export async function getNotifications(businessId: string): Promise<NotificationSetting[]> {
  const settings = await prisma.settings.findUnique({ where: { businessId } });

  if (!settings) {
    return [
      { id: 'review-alerts', title: 'Review Alerts', description: 'Instant push notification for new reviews', enabled: true },
      { id: 'weekly-summary', title: 'Weekly Summary', description: 'Email report of sentiment trends', enabled: true },
      { id: 'negative-flag', title: 'Negative Sentiment Flag', description: 'Urgent alerts for ≤3 star reviews', enabled: true },
    ];
  }

  return [
    { id: 'review-alerts', title: 'Review Alerts', description: 'Instant push notification for new reviews', enabled: settings.reviewAlerts },
    { id: 'weekly-summary', title: 'Weekly Summary', description: 'Email report of sentiment trends', enabled: settings.weeklySummary },
    { id: 'negative-flag', title: 'Negative Sentiment Flag', description: 'Urgent alerts for ≤3 star reviews', enabled: settings.negativeSentiment },
  ];
}

export async function updateNotifications(
  notifications: NotificationSetting[],
  businessId: string
): Promise<NotificationSetting[]> {
  const settings = await prisma.settings.findUnique({ where: { businessId } });
  if (!settings) return notifications;

  const reviewAlerts = notifications.find((n) => n.id === 'review-alerts')?.enabled ?? settings.reviewAlerts;
  const weeklySummary = notifications.find((n) => n.id === 'weekly-summary')?.enabled ?? settings.weeklySummary;
  const negativeSentiment = notifications.find((n) => n.id === 'negative-flag')?.enabled ?? settings.negativeSentiment;

  await prisma.settings.update({
    where: { id: settings.id },
    data: { reviewAlerts, weeklySummary, negativeSentiment },
  });

  return notifications;
}
