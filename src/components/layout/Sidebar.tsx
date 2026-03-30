'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquareText,
  BarChart3,
  Settings,
  Link2,
  HelpCircle,
  LogOut,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/reviews', label: 'Review Feed', icon: MessageSquareText },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-surface border-r border-border flex flex-col z-20">
      <Link href="/dashboard" className="block p-6 pb-2">
        <h1 className="text-xl font-bold text-navy">ReviewHub</h1>
        <p className="text-[11px] font-medium tracking-widest text-text-secondary uppercase">
          Small Biz Portal
        </p>
      </Link>

      <nav className="flex-1 mt-6 px-3">
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
        <button className="w-full flex items-center justify-center gap-2 bg-navy text-surface rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-navy-dark transition-colors dark:text-background">
          <Link2 size={16} />
          Connect Account
        </button>

        <div className="border-t border-border pt-3 mt-3 space-y-1">
          <button className="flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary w-full rounded-lg hover:bg-background transition-colors">
            <HelpCircle size={18} />
            Support
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary w-full rounded-lg hover:bg-background transition-colors">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
