import { notificationSettings } from '@/data/mockData';
import type { NotificationSetting } from '@/types';

export interface BusinessProfile {
  name: string;
  email: string;
  description: string;
}

const defaultProfile: BusinessProfile = {
  name: 'The Artisan Collective',
  email: 'hello@artisancollective.com',
  description:
    'Curating the finest local handmade goods for the modern home.\nEstablished 2018.',
};

export async function getProfile(): Promise<BusinessProfile> {
  // TODO: Replace with Prisma findFirst (business by owner)
  return defaultProfile;
}

export async function updateProfile(
  profile: Partial<BusinessProfile>
): Promise<BusinessProfile> {
  // TODO: Replace with Prisma update
  return { ...defaultProfile, ...profile };
}

export async function getNotifications(): Promise<NotificationSetting[]> {
  // TODO: Replace with Prisma findUnique (settings by business)
  return notificationSettings;
}

export async function updateNotifications(
  settings: NotificationSetting[]
): Promise<NotificationSetting[]> {
  // TODO: Replace with Prisma update
  return settings;
}
