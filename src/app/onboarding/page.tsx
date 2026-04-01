'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Check, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const industries = [
  '식당/카페',
  '미용/뷰티',
  '의료/치과',
  '숙박/호텔',
  '리테일/쇼핑',
  '전문서비스',
  '학원/교육',
  '기타',
];

const platformCards = [
  { key: 'google', name: 'Google', letter: 'G', bg: '#4285F4', desc: 'Google Business Profile' },
  { key: 'yelp', name: 'Yelp', letter: 'Y', bg: '#D32323', desc: 'Yelp Fusion API' },
  { key: 'facebook', name: 'Facebook', letter: 'f', bg: '#1877F2', desc: 'Facebook Page Reviews' },
  { key: 'whatsapp', name: 'WhatsApp', letter: 'W', bg: '#25D366', desc: 'WhatsApp Business' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [step, setStep] = useState(0);

  // Step 1 state
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');

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
    if (step === 0 && businessName) {
      // Save business info (optional API call)
      try {
        await fetch('/api/settings/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: businessName, industry, location }),
        });
      } catch {}
    }
    if (step === 2) {
      // Save notification settings
      try {
        await fetch('/api/settings/notifications', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
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
    await update(); // Refresh JWT
    router.push('/dashboard');
  };

  const progress = ((step + 1) / 4) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[560px]">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-secondary">Step {step + 1} of 4</span>
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
          {/* Step 1: Welcome + Business Info */}
          {step === 0 && (
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                ReviewHub에 오신 것을 환영합니다! 🎉
              </h1>
              <p className="text-sm text-text-secondary mb-8">
                비즈니스 정보를 입력하면 맞춤 설정이 됩니다.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">비즈니스 이름 *</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="예: 강남 카페"
                    className="w-full px-4 py-2.5 bg-surface text-text-primary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">업종</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface text-text-primary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  >
                    <option value="">선택하세요</option>
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">위치</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="예: 서울 강남구"
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
                리뷰를 가져올 플랫폼을 연결하세요
              </h2>
              <p className="text-sm text-text-secondary mb-6">
                나중에 Settings에서도 연결할 수 있습니다.
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
                        <div className="text-sm font-semibold text-text-primary">{p.name}</div>
                        <div className="text-[10px] text-text-secondary">{p.desc}</div>
                      </div>
                      {connected && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-success">
                          <Check size={14} /> Connected
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
                어떤 알림을 받고 싶으세요?
              </h2>
              <p className="text-sm text-text-secondary mb-6">
                언제든 Settings에서 변경할 수 있습니다.
              </p>
              <div className="space-y-4">
                {[
                  { label: '새 리뷰 즉시 알림', desc: '새 리뷰가 등록되면 바로 알려드립니다.', value: reviewAlerts, setter: setReviewAlerts },
                  { label: '주간 요약 이메일', desc: '매주 월요일 리뷰 요약을 보내드립니다.', value: weeklySummary, setter: setWeeklySummary },
                  { label: '부정 리뷰 긴급 알림', desc: '부정적인 리뷰가 감지되면 즉시 알려드립니다.', value: negativeSentiment, setter: setNegativeSentiment },
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
                모든 준비가 완료되었습니다!
              </h2>
              <p className="text-sm text-text-secondary mb-6">
                이제 대시보드에서 리뷰를 관리할 수 있습니다.
              </p>
              {connectedPlatforms.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs text-text-secondary uppercase tracking-wide mb-3">연결된 플랫폼</p>
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
                이전
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
                {step === 1 && connectedPlatforms.length === 0 ? '나중에 하기' : '다음'}
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 bg-navy text-white rounded-lg px-8 py-3 text-sm font-semibold hover:bg-navy-dark transition-colors mx-auto"
              >
                <Sparkles size={16} />
                대시보드로 이동
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
