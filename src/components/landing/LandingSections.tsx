'use client';

import Link from 'next/link';
import { LayoutDashboard, MessageSquare, Sparkles, Bell, Check, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FadeIn } from './LandingPage';

/* ───── Pain Points ───── */
function PainPointsSection() {
  const t = useTranslations('landing');
  const points = [
    { emoji: '😩', title: t('painPoints.wastedTime'), desc: t('painPoints.wastedTimeDesc') },
    { emoji: '😡', title: t('painPoints.lateResponses'), desc: t('painPoints.lateResponsesDesc') },
    { emoji: '📉', title: t('painPoints.expensiveTools'), desc: t('painPoints.expensiveToolsDesc') },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn>
          <h2 className="text-3xl font-bold text-navy text-center mb-4">
            {t('painPoints.title')}
          </h2>
          <p className="text-text-secondary text-center mb-12 max-w-xl mx-auto">
            {t('painPoints.subtitle')}
          </p>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-6">
          {points.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.1}>
              <div className="bg-background rounded-2xl p-8 border border-border text-center hover:shadow-md transition-shadow">
                <div className="text-5xl mb-4">{p.emoji}</div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{p.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{p.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── Solutions ───── */
function SolutionsSection() {
  const t = useTranslations('landing');
  const features = [
    {
      icon: LayoutDashboard,
      title: t('solutions.unifiedDashboard'),
      desc: t('solutions.unifiedDashboardDesc'),
    },
    {
      icon: MessageSquare,
      title: t('solutions.whatsappRequests'),
      desc: t('solutions.whatsappRequestsDesc'),
    },
    {
      icon: Sparkles,
      title: t('solutions.aiReplyGeneration'),
      desc: t('solutions.aiReplyGenerationDesc'),
    },
    {
      icon: Bell,
      title: t('solutions.realTimeAlerts'),
      desc: t('solutions.realTimeAlertsDesc'),
    },
  ];

  return (
    <section id="solutions" className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn>
          <h2 className="text-3xl font-bold text-navy text-center mb-4">
            {t('solutions.title')}
          </h2>
          <p className="text-text-secondary text-center mb-12 max-w-xl mx-auto">
            {t('solutions.subtitle')}
          </p>
        </FadeIn>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.1}>
              <div className="bg-surface rounded-2xl p-8 border border-border flex gap-5 hover:shadow-lg hover:scale-[1.02] transition-all cursor-default">
                <div className="w-12 h-12 rounded-xl bg-accent-blue/10 flex items-center justify-center shrink-0">
                  <f.icon size={24} className="text-accent-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">{f.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── Comparison ───── */
function ComparisonSection() {
  const t = useTranslations('landing');
  const rows = [
    { feature: t('comparison.reviewAggregation'), brightlocal: true, podium: true, reviewhub: true },
    { feature: t('comparison.whatsappAutomation'), brightlocal: false, podium: false, reviewhub: true },
    { feature: t('comparison.aiReplyGeneration'), brightlocal: false, podium: t('comparison.limited'), reviewhub: true },
    { feature: t('comparison.smallBusinessPricing'), brightlocal: false, podium: false, reviewhub: true },
    { feature: t('comparison.sentimentAnalysis'), brightlocal: true, podium: true, reviewhub: true },
    { feature: t('comparison.competitorBenchmarking'), brightlocal: true, podium: false, reviewhub: true },
  ];

  const renderCell = (val: boolean | string) => {
    if (val === true) return <span className="text-success font-bold">✓</span>;
    if (val === false) return <span className="text-text-secondary">✗</span>;
    return <span className="text-text-secondary text-xs">{val}</span>;
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <FadeIn>
          <h2 className="text-3xl font-bold text-navy text-center mb-4">
            {t('comparison.title')}
          </h2>
          <p className="text-text-secondary text-center mb-12">
            {t('comparison.subtitle')}
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-sm font-semibold text-text-primary p-4 border-b border-border">{t('comparison.feature')}</th>
                  <th className="text-center text-sm font-semibold text-text-secondary p-4 border-b border-border">
                    BrightLocal<br /><span className="text-xs font-normal">$44+/mo</span>
                  </th>
                  <th className="text-center text-sm font-semibold text-text-secondary p-4 border-b border-border">
                    Podium<br /><span className="text-xs font-normal">$399+/mo</span>
                  </th>
                  <th className="text-center text-sm font-bold text-navy p-4 border-b-2 border-accent-blue bg-accent-blue/5 rounded-t-xl">
                    ReviewHub<br /><span className="text-xs font-semibold text-accent-blue">$19/mo</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.feature} className="border-b border-border last:border-0">
                    <td className="text-sm text-text-primary p-4 font-medium">{row.feature}</td>
                    <td className="text-center p-4">{renderCell(row.brightlocal)}</td>
                    <td className="text-center p-4">{renderCell(row.podium)}</td>
                    <td className="text-center p-4 bg-accent-blue/5">{renderCell(row.reviewhub)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ───── Pricing ───── */
function PricingSection() {
  const t = useTranslations('landing');
  const plans = [
    {
      name: 'Starter',
      price: 19,
      popular: false,
      features: ['locations', 'aiReplies', 'whatsapp', 'integrations', 'analytics'] as const,
      planKey: 'starter' as const,
    },
    {
      name: 'Growth',
      price: 39,
      popular: true,
      features: ['locations', 'aiReplies', 'whatsapp', 'integrations', 'analytics', 'sentiment', 'competitors'] as const,
      planKey: 'growth' as const,
    },
    {
      name: 'Pro',
      price: 69,
      popular: false,
      features: ['locations', 'aiReplies', 'whatsapp', 'integrations', 'analytics', 'sentiment', 'competitors', 'support'] as const,
      planKey: 'pro' as const,
    },
  ];

  const tp = useTranslations('pricing');

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="max-w-5xl mx-auto px-6">
        <FadeIn>
          <h2 className="text-3xl font-bold text-navy text-center mb-4">{t('pricing.title')}</h2>
          <p className="text-text-secondary text-center mb-12">
            {t('pricing.subtitle')}
          </p>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.1}>
              <div className={`relative bg-surface rounded-2xl border-2 p-8 flex flex-col ${
                plan.popular ? 'border-accent-blue shadow-lg shadow-accent-blue/10' : 'border-border'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent-blue text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                      <Sparkles size={12} />
                      {tp('mostPopular')}
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-text-primary">{tp(`plans.${plan.planKey}.name`)}</h3>
                <div className="mt-4 mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-navy">${plan.price}</span>
                    <span className="text-text-secondary text-sm">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 flex-1">
                  {plan.features.map((featureKey) => (
                    <li key={featureKey} className="flex items-start gap-2 text-sm">
                      <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-text-secondary">{tp(`plans.${plan.planKey}.features.${featureKey}`)}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-8 w-full py-3 rounded-xl text-sm font-semibold text-center block transition-colors ${
                    plan.popular
                      ? 'bg-navy text-white hover:bg-navy-dark'
                      : 'bg-background text-text-primary border border-border hover:bg-border/50'
                  }`}
                >
                  {t('pricing.startForFree')}
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── Testimonials ───── */
function TestimonialsSection() {
  const t = useTranslations('landing');
  const reviews = [
    {
      name: t('testimonials.review1Name'),
      business: t('testimonials.review1Business'),
      rating: 5,
      text: t('testimonials.review1Text'),
      initials: 'KM',
    },
    {
      name: t('testimonials.review2Name'),
      business: t('testimonials.review2Business'),
      rating: 5,
      text: t('testimonials.review2Text'),
      initials: 'LJ',
    },
    {
      name: t('testimonials.review3Name'),
      business: t('testimonials.review3Business'),
      rating: 5,
      text: t('testimonials.review3Text'),
      initials: 'PS',
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn>
          <h2 className="text-3xl font-bold text-navy text-center mb-4">{t('testimonials.title')}</h2>
          <p className="text-text-secondary text-center mb-12">
            {t('testimonials.subtitle')}
          </p>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <FadeIn key={r.name} delay={i * 0.1}>
              <div className="bg-background rounded-2xl p-8 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-navy text-white flex items-center justify-center font-bold text-sm">
                    {r.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text-primary">{r.name}</div>
                    <div className="text-xs text-text-secondary">{r.business}</div>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-warning fill-warning" />
                  ))}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed italic">
                  &ldquo;{r.text}&rdquo;
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LandingSections() {
  return (
    <>
      <PainPointsSection />
      <SolutionsSection />
      <ComparisonSection />
      <PricingSection />
      <TestimonialsSection />
    </>
  );
}
