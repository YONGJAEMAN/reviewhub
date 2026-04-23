'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { X, AlertTriangle } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function DeleteAccountModal({ onClose }: Props) {
  const t = useTranslations('account');
  const tCommon = useTranslations('common');
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleDelete = async () => {
    if (!password || !confirmed) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || t('deleteModal.failedToDelete'));
        return;
      }
      setSuccess(true);
    } catch {
      setError(t('deleteModal.networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
    >
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-[480px] p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
              <AlertTriangle size={20} className="text-danger" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">{t('deleteModal.title')}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text-secondary hover:bg-background">
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div>
            <p className="text-sm text-text-secondary mb-4">
              {t('deleteModal.successMessage')}
            </p>
            <button
              onClick={onClose}
              className="w-full bg-navy text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-navy-dark transition-colors"
            >
              {tCommon('ok')}
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-danger/5 border border-danger/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-danger font-medium mb-1">{t('deleteModal.warningTitle')}</p>
              <ul className="text-xs text-text-secondary space-y-1 list-disc list-inside">
                {(t.raw('deleteModal.warningItems') as string[]).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {error && (
              <div className="bg-danger/10 border border-danger/20 rounded-lg px-4 py-3 mb-4">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-text-primary mb-2">
                {t('deleteModal.confirmPassword')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('deleteModal.passwordPlaceholder')}
                className="w-full px-4 py-2.5 bg-surface text-text-primary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-danger"
              />
            </div>

            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-border text-danger focus:ring-danger"
              />
              <span className="text-sm text-text-secondary">
                {t('deleteModal.confirmCheckbox')}
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-4 py-2.5 border border-border rounded-lg"
              >
                {tCommon('cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={!password || !confirmed || loading}
                className="flex-1 bg-danger text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? tCommon('processing') : t('deleteModal.requestDeletion')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
