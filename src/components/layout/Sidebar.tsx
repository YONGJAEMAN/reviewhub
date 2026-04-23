'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  MessageSquareText,
  BarChart3,
  MessageCircle,
  Settings,
  Link2,
  HelpCircle,
  LogOut,
  Crown,
  QrCode,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import BusinessSwitcher from './BusinessSwitcher';
import { useBusinessContext } from '@/components/BusinessContext';

interface SubInfo {
  plan: string;
  status: string;
  trialDaysLeft: number;
  trialExpired: boolean;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { activeBusiness } = useBusinessContext();
  const [sub, setSub] = useState<SubInfo | null>(null);
  const t = useTranslations('nav');

  const navItems = [
    { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/reviews', label: t('reviews'), icon: MessageSquareText },
    { href: '/analytics', label: t('analytics'), icon: BarChart3 },
    { href: '/review-requests', label: t('reviewRequests'), icon: MessageCircle },
    { href: '/review-requests/qr', label: t('qrCards'), icon: QrCode },
    { href: '/settings', label: t('settings'), icon: Settings },
  ];

  useEffect(() => {
    if (!activeBusiness) return;
    fetch(`/api/subscription?businessId=${activeBusiness.businessId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setSub(json.data);
      })
      .catch(() => {});
  }, [activeBusiness]);

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-surface border-r border-border hidden md:flex flex-col z-20">
      <Link href="/dashboard" className="block p-6 pb-2">
        <h1 className="text-xl font-bold text-navy">ReviewHub</h1>
        <p className="text-[11px] font-medium tracking-widest text-text-secondary uppercase">
          {t('tagline')}
        </p>
      </Link>

      <BusinessSwitcher />

      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
                isActive
                  ? 'text-navy font-semibold border-l-[3px] border-accent-blue bg-background'
                  : 'text-text-secondary hover:bg-background hover:text-text-primary'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-6 space-y-2">
        {/* Trial Badge */}
        {sub?.status === 'TRIALING' && !sub.trialExpired && (
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
              sub.trialDaysLeft <= 3
                ? 'bg-amber-50 text-amber-700'
                : 'bg-blue-50 text-blue-700'
            }`}
          >
            <Crown size={14} />
            <span>
              {t('trial', { daysLeft: sub.trialDaysLeft })}
              {sub.trialDaysLeft <= 3 && (
                <>
                  {' — '}
                  <Link href="/pricing" className="underline font-semibold">
                    {t('upgrade')}
                  </Link>
                </>
              )}
            </span>
          </div>
        )}

        {sub?.trialExpired && sub.plan === 'FREE' && (
          <Link
            href="/pricing"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-700"
          >
            <Crown size={14} />
            {t('trialExpired')}
          </Link>
        )}

        <button className="w-full flex items-center justify-center gap-2 bg-navy text-surface rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-navy-dark transition-colors dark:text-background">
          <Link2 size={16} />
          {t('connectAccount')}
        </button>

        <div className="border-t border-border pt-3 mt-3 space-y-1">
          <button className="flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary w-full rounded-lg hover:bg-background transition-colors">
            <HelpCircle size={18} />
            {t('support')}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary w-full rounded-lg hover:bg-background transition-colors"
          >
            <LogOut size={18} />
            {t('logout')}
          </button>
        </div>
      </div>
    </aside>
  );
}
