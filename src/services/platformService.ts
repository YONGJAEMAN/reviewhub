import { platformConnections } from '@/data/mockData';
import type { PlatformConnection } from '@/types';

export async function getPlatforms(): Promise<PlatformConnection[]> {
  // TODO: Replace with Prisma query
  return platformConnections;
}

export async function connectPlatform(
  id: string
): Promise<PlatformConnection | null> {
  // TODO: Replace with Prisma update + OAuth flow
  const conn = platformConnections.find((c) => c.platform === id);
  if (!conn) return null;
  return { ...conn, connected: true, detail: 'Just connected' };
}

export async function disconnectPlatform(
  id: string
): Promise<PlatformConnection | null> {
  // TODO: Replace with Prisma update + revoke tokens
  const conn = platformConnections.find((c) => c.platform === id);
  if (!conn) return null;
  return { ...conn, connected: false, detail: 'Disconnected' };
}

export async function syncPlatform(
  id: string
): Promise<{ platform: string; synced: boolean }> {
  // TODO: Replace with actual platform sync logic
  return { platform: id, synced: true };
}
