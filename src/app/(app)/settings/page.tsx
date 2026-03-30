'use client';

import PlatformConnectionCard from '@/components/settings/PlatformConnectionCard';
import BusinessProfile from '@/components/settings/BusinessProfile';
import NotificationSettings from '@/components/settings/NotificationSettings';
import { platformConnections } from '@/data/mockData';

export default function SettingsPage() {
  const activeCount = platformConnections.filter((c) => c.connected).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage your business profile and platform integrations from one central hub.
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold text-text-primary">Platform Connections</h2>
          <span className="text-sm text-text-secondary">
            {activeCount} Active Channels
          </span>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {platformConnections.map((conn) => (
            <PlatformConnectionCard key={conn.platform} connection={conn} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <BusinessProfile />
        </div>
        <NotificationSettings />
      </div>
    </div>
  );
}
