'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, Loader2, MapPin, Building2 } from 'lucide-react';

interface GoogleAccount {
  name: string;
  accountName: string;
  type?: string;
}

interface GoogleLocation {
  name: string;
  title: string;
  storefrontAddress?: {
    addressLines?: string[];
    locality?: string;
    administrativeArea?: string;
  };
}

interface Props {
  businessId: string;
  onClose: () => void;
  onConnected: () => void;
}

export default function GoogleConnectModal({ businessId, onClose, onConnected }: Props) {
  const [step, setStep] = useState<'accounts' | 'locations'>('accounts');
  const [accounts, setAccounts] = useState<GoogleAccount[]>([]);
  const [locations, setLocations] = useState<GoogleLocation[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<GoogleAccount | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<GoogleLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/google/accounts');
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed to load Google accounts');
        return;
      }
      const accts = json.data || [];
      setAccounts(accts);
      if (accts.length === 1) {
        setSelectedAccount(accts[0]);
        setStep('locations');
        await loadLocations(accts[0].name);
      }
    } catch {
      setError('Failed to connect to Google. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function loadLocations(accountName: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/google/locations?accountId=${encodeURIComponent(accountName)}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed to load locations');
        return;
      }
      setLocations(json.data || []);
    } catch {
      setError('Failed to load locations');
    } finally {
      setLoading(false);
    }
  }

  function handleAccountSelect(account: GoogleAccount) {
    setSelectedAccount(account);
    setStep('locations');
    loadLocations(account.name);
  }

  function formatAddress(loc: GoogleLocation): string {
    const addr = loc.storefrontAddress;
    if (!addr) return '';
    const parts = [
      ...(addr.addressLines || []),
      addr.locality,
      addr.administrativeArea,
    ].filter(Boolean);
    return parts.join(', ');
  }

  async function handleConnect() {
    if (!selectedAccount || !selectedLocation) return;

    setConnecting(true);
    setError('');

    const accountId = selectedAccount.name.replace('accounts/', '');
    const locationParts = selectedLocation.name.split('/');
    const locationId = locationParts[locationParts.length - 1];

    try {
      const res = await fetch('/api/google/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          locationId,
          locationName: selectedLocation.title,
          businessId,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Failed to connect');
        return;
      }

      // Trigger initial sync
      const platformId = json.data?.id;
      if (platformId) {
        try {
          await fetch('/api/google/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ platformId }),
          });
        } catch { /* initial sync failure is non-critical */ }
      }

      onConnected();
    } catch {
      setError('Failed to connect Google platform');
    } finally {
      setConnecting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface rounded-xl border border-border shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#4285F4] flex items-center justify-center text-white font-bold text-sm">
              G
            </div>
            <h2 className="text-lg font-semibold text-text-primary">Connect Google Business</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm mb-4 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={24} className="text-accent-blue animate-spin mb-3" />
              <p className="text-sm text-text-secondary">
                {step === 'accounts' ? 'Loading Google accounts...' : 'Loading locations...'}
              </p>
            </div>
          ) : step === 'accounts' ? (
            <div>
              <p className="text-sm text-text-secondary mb-4">
                Select your Google Business account:
              </p>
              {accounts.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-8">
                  No Google Business accounts found. Make sure your Google account has access to a Business Profile.
                </p>
              ) : (
                <div className="space-y-2">
                  {accounts.map((account) => (
                    <button
                      key={account.name}
                      onClick={() => handleAccountSelect(account)}
                      className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:border-accent-blue hover:bg-background/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Building2 size={18} className="text-text-secondary" />
                        <div>
                          <p className="text-sm font-medium text-text-primary">{account.accountName}</p>
                          <p className="text-xs text-text-secondary">{account.type || 'Business Account'}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-text-secondary" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <button
                onClick={() => { setStep('accounts'); setSelectedLocation(null); }}
                className="text-xs text-accent-blue hover:underline mb-3 inline-block"
              >
                ← Back to accounts
              </button>
              <p className="text-sm text-text-secondary mb-4">
                Select a location for <span className="font-medium text-text-primary">{selectedAccount?.accountName}</span>:
              </p>
              {locations.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-8">
                  No locations found for this account.
                </p>
              ) : (
                <div className="space-y-2 mb-4">
                  {locations.map((loc) => (
                    <button
                      key={loc.name}
                      onClick={() => setSelectedLocation(loc)}
                      className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-colors text-left ${
                        selectedLocation?.name === loc.name
                          ? 'border-accent-blue bg-accent-blue/5'
                          : 'border-border hover:border-accent-blue/50'
                      }`}
                    >
                      <MapPin size={18} className={selectedLocation?.name === loc.name ? 'text-accent-blue' : 'text-text-secondary'} />
                      <div>
                        <p className="text-sm font-medium text-text-primary">{loc.title}</p>
                        {formatAddress(loc) && (
                          <p className="text-xs text-text-secondary">{formatAddress(loc)}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-text-secondary hover:bg-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConnect}
                  disabled={!selectedLocation || connecting}
                  className="flex-1 px-4 py-2.5 bg-navy text-surface rounded-lg text-sm font-medium hover:bg-navy-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {connecting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
