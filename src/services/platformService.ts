import { prisma } from '@/lib/prisma';
import type { PlatformConnection } from '@/types';

function toFrontendPlatform(p: {
  id: string;
  type: string;
  name: string;
  status: string;
  detail: string | null;
}): PlatformConnection {
  return {
    platform: p.type.toLowerCase() as PlatformConnection['platform'],
    name: p.name,
    connected: p.status === 'CONNECTED',
    detail: p.detail ?? '',
  };
}

export async function getPlatforms(businessId?: string): Promise<PlatformConnection[]> {
  const platforms = await prisma.platform.findMany({
    where: businessId ? { businessId } : undefined,
    orderBy: { createdAt: 'asc' },
  });
  return platforms.map(toFrontendPlatform);
}

export async function connectPlatform(
  id: string
): Promise<PlatformConnection | null> {
  try {
    const platform = await prisma.platform.update({
      where: { id },
      data: { status: 'CONNECTED', detail: 'Just connected' },
    });
    return toFrontendPlatform(platform);
  } catch {
    return null;
  }
}

export async function disconnectPlatform(
  id: string
): Promise<PlatformConnection | null> {
  try {
    const platform = await prisma.platform.update({
      where: { id },
      data: { status: 'DISCONNECTED', detail: 'Disconnected' },
    });
    return toFrontendPlatform(platform);
  } catch {
    return null;
  }
}

export async function syncPlatform(
  id: string
): Promise<{ platform: string; synced: boolean }> {
  const platform = await prisma.platform.findUnique({ where: { id } });
  if (!platform) return { platform: id, synced: false };

  await prisma.platform.update({
    where: { id },
    data: { lastSynced: new Date(), detail: 'Last synced just now' },
  });
  return { platform: platform.type.toLowerCase(), synced: true };
}
