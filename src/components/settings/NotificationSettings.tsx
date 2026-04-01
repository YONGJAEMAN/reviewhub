'use client';

import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { NotificationSetting } from '@/types';

export default function NotificationSettings() {
  const t = useTranslations('settings');
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [autoReport, setAutoReport] = useState(false);

  useEffect(() => {
    fetch('/api/settings/notifications')
      .then((res) => res.json())
      .then((json) => setSettings(json.data))
      .catch(console.error);
  }, []);

  const toggle = (id: string) => {
    const updated = settings.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    setSettings(updated);
    fetch('/api/settings/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(console.error);
  };

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-6">Notifications</h2>

      <div className="space-y-5">
        {settings.map((setting) => (
          <div key={setting.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">{setting.title}</p>
              <p className="text-xs text-text-secondary">{setting.description}</p>
            </div>
            <button
              onClick={() => toggle(setting.id)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                setting.enabled ? 'bg-success' : 'bg-border'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-surface shadow-sm transition-transform ${
                  setting.enabled ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Auto Monthly Report */}
      <div className="mt-5 flex items-center justify-between pt-5 border-t border-border">
        <div>
          <p className="text-sm font-medium text-text-primary">{t('autoMonthlyReport')}</p>
          <p className="text-xs text-text-secondary">{t('autoMonthlyReportDesc')}</p>
        </div>
        <button
          onClick={() => {
            setAutoReport(!autoReport);
            fetch('/api/settings/notifications', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ autoMonthlyReport: !autoReport }),
            }).catch(console.error);
          }}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            autoReport ? 'bg-success' : 'bg-border'
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-surface shadow-sm transition-transform ${
              autoReport ? 'left-[22px]' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      <div className="mt-6 bg-badge-blue border border-accent-blue/20 rounded-lg p-4 flex gap-3">
        <Info size={18} className="text-accent-blue shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-accent-blue">PRO TIP</p>
          <p className="text-xs text-text-secondary mt-1">
            Connecting your WhatsApp allows you to reply to reviews directly from your mobile
            app.
          </p>
        </div>
      </div>
    </div>
  );
}
