'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Check, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import AddressAutocomplete from '@/components/AddressAutocomplete';

const industryKeys = [
  'restaurant',
  'beauty',
  'medical',
  'hospitality',
  'retail',
  'professional',
  'education',
  'other',
] as const;

const platformCards = [
  { key: 'google', nameKey: 'platforms.google', letter: 'G', bg: '#4285F4', descKey: 'platforms.googleDesc' },
  { key: 'yelp', nameKey: 'platforms.yelp', letter: 'Y', bg: '#D32323', descKey: 'platforms.yelpDesc' },
  { key: 'facebook', nameKey: 'platforms.facebook', letter: 'f', bg: '#1877F2', descKey: 'platforms.facebookDesc' },
  { key: 'whatsapp', nameKey: 'platforms.whatsapp', letter: 'W', bg: '#25D366', descKey: 'platforms.whatsappDesc' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const t = useTranslations('onboarding');
  const tc = useTranslations('common');
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');

  // Step 1 state
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [createdBusinessId, setCreatedBusinessId] = useState<string | null>(null);

  // Step 2 state
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  // Step 3 state
  const [reviewAlerts, setReviewAlerts] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [negativeSentiment, setNegativeSentiment] = useState(true);

  // Step 4 confetti
  useEffect(() => {
    if (step === 3) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [step]);

  const handleNext = async () => {
    setError('');
    if (step === 0 && businessName) {
      try {
        const res = await fetch('/api/businesses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: businessName }),
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || t('failedToCreateBusiness'));
          return;
        }
        if (json.data?.businessId) {
          setCreatedBusinessId(json.data.businessId);
          await fetch('/api/settings/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: businessName, industry, location, businessId: json.data.businessId }),
          }).catch(() => {});
        }
      } catch {
        setError(t('somethingWentWrong'));
        return;
      }
    }
    if (step === 2 && createdBusinessId) {
      try {
        await fetch('/api/settings/notifications', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId: createdBusinessId,
            settings: [
              { id: 'reviewAlerts', enabled: reviewAlerts },
              { id: 'weeklySummary', enabled: weeklySummary },
              { id: 'negativeSentiment', enabled: negativeSentiment },
            ],
          }),
        });
      } catch {}
    }
    setStep((s) => s + 1);
  };

  const handleComplete = async () => {
    await fetch('/api/account/onboarding-complete', { method: 'POST' });
    await update();
    router.push('/dashboard');
  };

  const progress = ((step + 1) / 4) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[560px]">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-secondary">{t('stepOf', { step: step + 1, total: 4 })}</span>
            <span className="text-sm text-text-secondary">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-blue rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger/10 text-danger text-sm">{error}</div>
          )}

          {/* Step 1: Welcome + Business Info */}
          {step === 0 && (
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                {t('step1.title')}
              </h1>
              <p className="text-sm text-text-secondary mb-8">
                {t('step1.subtitle')}
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">{t('step1.businessNameLabel')}</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder={t('step1.businessNamePlaceholder')}
                    className="w-full px-4 py-2.5 bg-surface text-text-primary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">{t('step1.industryLabel')}</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface text-text-primary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  >
                    <option value="">{t('step1.selectIndustry')}</option>
                    {industryKeys.map((key) => (
                      <option key={key} value={t(`industries.${key}`)}>{t(`industries.${key}`)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">{t('step1.locationLabel')}</label>
                  <AddressAutocomplete
                    value={location}
                    onChange={setLocation}
                    placeholder={t('step1.locationPlaceholder')}
                    className="w-full px-4 py-2.5 bg-surface text-text-primary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Platform Connect */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-2">
                {t('step2.title')}
              </h2>
              <p className="text-sm text-text-secondary mb-6">
                {t('step2.subtitle')}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {platformCards.map((p) => {
                  const connected = connectedPlatforms.includes(p.key);
                  return (
                    <button
                      key={p.key}
                      onClick={() => {
                        setConnectedPlatforms((prev) =>
                          connected ? prev.filter((k) => k !== p.key) : [...prev, p.key]
                        );
                      }}
                      className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                        connected ? 'border-success bg-success/5' : 'border-border hover:border-accent-blue'
                      }`}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: p.bg }}
                      >
                        {p.letter}
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-text-primary">{t(p.nameKey)}</div>
                        <div className="text-[10px] text-text-secondary">{t(p.descKey)}</div>
                      </div>
                      {connected && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-success">
                          <Check size={14} /> {t('step2.connected')}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Notification Settings */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-2">
                {t('step3.title')}
              </h2>
              <p className="text-sm text-text-secondary mb-6">
                {t('step3.subtitle')}
              </p>
              <div className="space-y-4">
                {[
                  { label: t('step3.newReviewAlerts'), desc: t('step3.newReviewAlertsDesc'), value: reviewAlerts, setter: setReviewAlerts },
                  { label: t('step3.weeklySummary'), desc: t('step3.weeklySummaryDesc'), value: weeklySummary, setter: setWeeklySummary },
                  { label: t('step3.negativeAlerts'), desc: t('step3.negativeAlertsDesc'), value: negativeSentiment, setter: setNegativeSentiment },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-xl border border-border">
                    <div>
                      <div className="text-sm font-medium text-text-primary">{item.label}</div>
                      <div className="text-xs text-text-secondary mt-0.5">{item.desc}</div>
                    </div>
                    <button
                      onClick={() => item.setter(!item.value)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${item.value ? 'bg-success' : 'bg-border'}`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-surface shadow-sm transition-transform ${
                          item.value ? 'left-[22px]' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 3 && (
            <div className="text-center">
              <div className="text-5xl mb-4">🎊</div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                {t('step4.title')}
              </h2>
              <p className="text-sm text-text-secondary mb-6">
                {t('step4.subtitle')}
              </p>
              {connectedPlatforms.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs text-text-secondary uppercase tracking-wide mb-3">{t('step4.connectedPlatforms')}</p>
                  <div className="flex justify-center gap-3">
                    {connectedPlatforms.map((key) => {
                      const p = platformCards.find((pc) => pc.key === key)!;
                      return (
                        <div
                          key={key}
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: p.bg }}
                        >
                          {p.letter}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            {step > 0 && step < 3 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                <ArrowLeft size={16} />
                {tc('back')}
              </button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={step === 0 && !businessName}
                className="flex items-center gap-2 bg-navy text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-navy-dark transition-colors disabled:opacity-40"
              >
                {step === 1 && connectedPlatforms.length === 0 ? t('skipForNow') : tc('next')}
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 bg-navy text-white rounded-lg px-8 py-3 text-sm font-semibold hover:bg-navy-dark transition-colors mx-auto"
              >
                <Sparkles size={16} />
                {t('step4.goToDashboard')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
