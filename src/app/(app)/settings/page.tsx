'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useBusinessContext } from '@/components/BusinessContext';
import PlatformConnectionCard from '@/components/settings/PlatformConnectionCard';
import BusinessProfile from '@/components/settings/BusinessProfile';
import NotificationSettings from '@/components/settings/NotificationSettings';
import SubscriptionManager from '@/components/settings/SubscriptionManager';
import TeamMembers from '@/components/settings/TeamMembers';
import CompetitorTracking from '@/components/settings/CompetitorTracking';
import ReferralSection from '@/components/settings/ReferralSection';
import DeleteAccountModal from '@/components/settings/DeleteAccountModal';
import type { PlatformConnection } from '@/types';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const { activeBusiness } = useBusinessContext();
  const bid = activeBusiness?.businessId;
  const [platforms, setPlatforms] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!bid) return;
    fetch(`/api/platforms?businessId=${bid}`)
      .then((res) => res.json())
      .then((json) => setPlatforms(json.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bid]);

  const activeCount = platforms.filter((c) => c.connected).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-text-primary">{t('title')}</h1>
        <p className="text-sm text-text-secondary mt-1">
          {t('subtitle')}
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold text-text-primary">{t('platformConnections')}</h2>
          <span className="text-sm text-text-secondary">
            {activeCount} {t('activeChannels')}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {platforms.map((conn) => (
            <PlatformConnectionCard key={conn.platform} connection={conn} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <BusinessProfile />
        </div>
        <div className="space-y-6">
          <NotificationSettings />
          <SubscriptionManager />
        </div>
      </div>

      <div className="mb-8">
        <CompetitorTracking />
      </div>

      <TeamMembers />

      <div className="mt-8">
        <ReferralSection />
      </div>

      {/* Danger Zone */}
      <div className="mt-8 bg-surface rounded-xl shadow-sm border-2 border-danger/30 p-6">
        <h2 className="text-lg font-semibold text-danger mb-2">{t('dangerZone')}</h2>
        <p className="text-sm text-text-secondary mb-4">
          {t('dangerDescription')}
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="bg-danger text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-red-700 transition-colors"
        >
          {t('deleteAccount')}
        </button>
      </div>
      {showDeleteModal && <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />}
    </div>
  );
}
