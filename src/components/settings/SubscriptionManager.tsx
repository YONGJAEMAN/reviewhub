'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ExternalLink, Crown } from 'lucide-react';

interface SubInfo {
  plan: string;
  status: string;
  trialEndsAt: string | null;
  trialDaysLeft: number;
  trialExpired: boolean;
  currentPeriodEnd: string | null;
  limits: {
    aiReplies: number;
    whatsapp: number;
    businesses: number;
    competitors: number;
  };
}

const planLabels: Record<string, string> = {
  FREE: 'Free',
  STARTER: 'Starter',
  GROWTH: 'Growth',
  PRO: 'Pro',
};

const statusLabels: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Active', color: 'text-emerald-600 bg-emerald-50' },
  TRIALING: { label: 'Trial', color: 'text-blue-600 bg-blue-50' },
  CANCELED: { label: 'Canceled', color: 'text-red-600 bg-red-50' },
  PAST_DUE: { label: 'Past Due', color: 'text-amber-600 bg-amber-50' },
};

export default function SubscriptionManager() {
  const [sub, setSub] = useState<SubInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/subscription')
      .then((res) => res.json())
      .then((json) => setSub(json.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const json = await res.json();
      if (json.data?.url) {
        window.location.href = json.data.url;
      }
    } catch {
      // silently fail
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center justify-center h-20">
          <div className="w-5 h-5 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!sub) return null;

  const statusCfg = statusLabels[sub.status] ?? statusLabels.ACTIVE;
  const formatLimit = (val: number) => (val === -1 ? 'Unlimited' : val.toString());

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard size={18} className="text-accent-blue" />
        <h2 className="text-lg font-semibold text-text-primary">Subscription</h2>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Crown size={16} className="text-amber-500" />
          <span className="text-xl font-bold text-navy">
            {planLabels[sub.plan] ?? sub.plan}
          </span>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCfg.color}`}>
          {statusCfg.label}
        </span>
      </div>

      {sub.status === 'TRIALING' && !sub.trialExpired && (
        <p className="text-sm text-text-secondary mb-4">
          Trial ends in <span className="font-semibold text-text-primary">{sub.trialDaysLeft} days</span>
          {sub.trialEndsAt && (
            <span className="text-text-secondary">
              {' '}({new Date(sub.trialEndsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
            </span>
          )}
        </p>
      )}

      {sub.trialExpired && (
        <p className="text-sm text-red-600 mb-4">
          Your trial has expired. Upgrade to continue using all features.
        </p>
      )}

      {sub.currentPeriodEnd && sub.status === 'ACTIVE' && (
        <p className="text-sm text-text-secondary mb-4">
          Next billing:{' '}
          {new Date(sub.currentPeriodEnd).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      )}

      {/* Limits */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-background rounded-lg p-3">
          <p className="text-[11px] font-medium text-text-secondary uppercase tracking-wide">AI Replies</p>
          <p className="text-sm font-semibold text-text-primary">{formatLimit(sub.limits.aiReplies)}/month</p>
        </div>
        <div className="bg-background rounded-lg p-3">
          <p className="text-[11px] font-medium text-text-secondary uppercase tracking-wide">WhatsApp</p>
          <p className="text-sm font-semibold text-text-primary">{formatLimit(sub.limits.whatsapp)}/month</p>
        </div>
        <div className="bg-background rounded-lg p-3">
          <p className="text-[11px] font-medium text-text-secondary uppercase tracking-wide">Locations</p>
          <p className="text-sm font-semibold text-text-primary">{sub.limits.businesses}</p>
        </div>
        <div className="bg-background rounded-lg p-3">
          <p className="text-[11px] font-medium text-text-secondary uppercase tracking-wide">Competitors</p>
          <p className="text-sm font-semibold text-text-primary">{sub.limits.competitors}</p>
        </div>
      </div>

      <div className="space-y-2">
        {sub.status === 'ACTIVE' && (
          <button
            onClick={handleManage}
            disabled={portalLoading}
            className="w-full flex items-center justify-center gap-2 border border-border rounded-lg px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-background transition-colors disabled:opacity-50"
          >
            <ExternalLink size={14} />
            {portalLoading ? 'Opening...' : 'Manage Subscription'}
          </button>
        )}
        <button
          onClick={() => router.push('/pricing')}
          className="w-full flex items-center justify-center gap-2 bg-navy text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-navy-dark transition-colors"
        >
          <Crown size={14} />
          {sub.status === 'ACTIVE' ? 'Change Plan' : 'Upgrade Plan'}
        </button>
      </div>
    </div>
  );
}
