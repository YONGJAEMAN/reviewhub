'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Star, AlertTriangle, Clock, AlertCircle, Zap } from 'lucide-react';
import { useBusinessContext } from '@/components/BusinessContext';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
}

const typeIcon: Record<string, typeof Star> = {
  NEW_REVIEW: Star,
  NEGATIVE_REVIEW: AlertTriangle,
  REPLY_REMINDER: Clock,
  SYNC_ERROR: AlertCircle,
  PLAN_LIMIT: Zap,
};

const typeColor: Record<string, string> = {
  NEW_REVIEW: 'text-accent-blue',
  NEGATIVE_REVIEW: 'text-danger',
  REPLY_REMINDER: 'text-amber-500',
  SYNC_ERROR: 'text-red-500',
  PLAN_LIMIT: 'text-purple-500',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationDropdown() {
  const router = useRouter();
  const { activeBusiness } = useBusinessContext();
  const bid = activeBusiness?.businessId;
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchNotifications = async () => {
    if (!bid) return;
    try {
      const res = await fetch(`/api/notifications?businessId=${bid}&limit=10`);
      const json = await res.json();
      if (json.data) {
        setNotifications(json.data.notifications);
        setUnreadCount(json.data.unreadCount);
      }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [bid]);

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      await fetch(`/api/notifications/${n.id}`, { method: 'PATCH' });
      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, isRead: true } : x));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    if (n.actionUrl) router.push(n.actionUrl);
    setOpen(false);
  };

  const handleMarkAll = async () => {
    if (!bid) return;
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: bid }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className="relative p-2 text-text-secondary hover:text-navy transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-danger text-white text-[10px] font-bold rounded-full px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface rounded-xl border border-border shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h4 className="text-sm font-semibold text-text-primary">Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={handleMarkAll} className="text-xs text-accent-blue hover:underline">
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-8">No notifications yet</p>
            ) : (
              notifications.map((n) => {
                const Icon = typeIcon[n.type] || Bell;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-background transition-colors text-left ${
                      !n.isRead ? 'bg-accent-blue/5' : ''
                    }`}
                  >
                    <div className={`mt-0.5 ${typeColor[n.type] || 'text-text-secondary'}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.isRead ? 'font-semibold' : 'font-medium'} text-text-primary truncate`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-text-secondary line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-text-secondary mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-accent-blue mt-1.5 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
