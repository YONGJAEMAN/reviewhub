'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquareText, Settings, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function MobileTabBar() {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const [showMore, setShowMore] = useState(false);

  const tabs = [
    { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/reviews', label: t('reviews'), icon: MessageSquareText },
    { href: '/settings', label: t('settings'), icon: Settings },
  ];

  const moreItems = [
    { href: '/analytics', label: t('analytics') },
    { href: '/review-requests', label: t('reviewRequests') },
  ];

  return (
    <>
      {showMore && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowMore(false)}>
          <div className="absolute bottom-[68px] left-4 right-4 bg-surface border border-border rounded-xl shadow-lg overflow-hidden">
            {moreItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setShowMore(false)}
                className={`block px-4 py-3 text-sm font-medium transition-colors ${
                  pathname.startsWith(item.href)
                    ? 'text-navy bg-background'
                    : 'text-text-secondary hover:bg-background'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border md:hidden">
        <div className="flex items-center justify-around h-[60px] px-2">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                  isActive ? 'text-navy' : 'text-text-secondary'
                }`}
              >
                <tab.icon size={20} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
              showMore ? 'text-navy' : 'text-text-secondary'
            }`}
          >
            <MoreHorizontal size={20} />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
