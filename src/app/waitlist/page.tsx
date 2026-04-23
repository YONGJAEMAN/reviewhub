'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function WaitlistPage() {
  const t = useTranslations('waitlist');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, company }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || t('failedToJoin'));
        return;
      }
      setSubmitted(true);
    } catch {
      setError(t('networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-navy">{tCommon('reviewHub')}</Link>
          <p className="text-[11px] font-medium tracking-widest text-text-secondary uppercase">
            {tNav('tagline')}
          </p>
        </div>

        <div className="bg-surface rounded-xl shadow-sm border border-border p-8">
          {submitted ? (
            <div className="text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-xl font-bold text-text-primary mb-2">{t('success.title')}</h2>
              <p className="text-sm text-text-secondary mb-6">
                {t('success.message')}
              </p>
              <Link href="/" className="text-sm text-accent-blue hover:underline">
                {t('success.backToHome')}
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-text-primary mb-1">{t('title')}</h2>
              <p className="text-sm text-text-secondary mb-6">
                {t('subtitle')}
              </p>

              {error && (
                <div className="bg-danger/10 border border-danger/20 rounded-lg px-4 py-3 mb-4">
                  <p className="text-sm text-danger">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-2">
                    {t('nameLabel')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('namePlaceholder')}
                    className="w-full px-4 py-2.5 bg-surface text-text-primary border border-border rounded-lg text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-2">
                    {t('emailLabel')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    required
                    className="w-full px-4 py-2.5 bg-surface text-text-primary border border-border rounded-lg text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-2">
                    {t('businessNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder={t('businessNamePlaceholder')}
                    className="w-full px-4 py-2.5 bg-surface text-text-primary border border-border rounded-lg text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-navy text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-navy-dark transition-colors disabled:opacity-50"
                >
                  {loading ? t('submitting') : t('joinWaitlist')}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
