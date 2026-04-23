'use client';

import { useState } from 'react';
import { X, RefreshCw, Unlink, Loader2, CheckCircle2 } from 'lucide-react';
import type { PlatformConnection } from '@/types';
import { platformConfig } from '@/lib/platformConfig';

interface Props {
  platform: PlatformConnection;
  onClose: () => void;
  onUpdated: () => void;
}

export default function PlatformManageModal({ platform, onClose, onUpdated }: Props) {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ synced: number; errors: string[] } | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const config = platformConfig[platform.platform];
  const canSync = platform.platform === 'google' || platform.platform === 'facebook';

  function formatLastSynced(): string {
    if (!platform.lastSynced) return 'Never';
    const diff = Date.now() - new Date(platform.lastSynced).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    setError('');
    try {
      const endpoint = platform.platform === 'google' ? '/api/google/sync' : '/api/google/sync';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformId: platform.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Sync failed');
        return;
      }
      setSyncResult(json.data);
    } catch {
      setError('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    setError('');
    try {
      const res = await fetch(`/api/platforms/${platform.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || 'Failed to disconnect');
        return;
      }
      onUpdated();
    } catch {
      setError('Failed to disconnect');
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface rounded-xl border border-border shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: config.color }}
            >
              {config.letter}
            </div>
            <h2 className="text-lg font-semibold text-text-primary">Manage {config.label}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between p-4 rounded-lg bg-background">
            <div>
              <p className="text-sm font-medium text-text-primary">{platform.name}</p>
              <p className="text-xs text-text-secondary">{platform.detail}</p>
            </div>
            <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase bg-success text-white">
              Connected
            </span>
          </div>

          <div className="text-sm text-text-secondary">
            Last synced: <span className="font-medium text-text-primary">{formatLastSynced()}</span>
          </div>

          {canSync && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-text-primary hover:bg-background transition-colors disabled:opacity-50"
            >
              {syncing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Sync Now
                </>
              )}
            </button>
          )}

          {syncResult && (
            <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
              <CheckCircle2 size={16} />
              {syncResult.synced} reviews synced
              {syncResult.errors.length > 0 && ` (${syncResult.errors.length} errors)`}
            </div>
          )}

          <div className="pt-2 border-t border-border">
            {showConfirm ? (
              <div className="space-y-3">
                <p className="text-sm text-text-secondary">
                  Are you sure? This will stop syncing reviews from {config.label}.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-text-secondary hover:bg-background transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    className="flex-1 px-4 py-2.5 bg-danger text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {disconnecting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Disconnecting...
                      </>
                    ) : (
                      <>
                        <Unlink size={14} />
                        Disconnect
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-danger hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/10"
              >
                <Unlink size={14} />
                Disconnect Platform
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
