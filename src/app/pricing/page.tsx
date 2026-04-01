'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';

const plans = [
  {
    key: 'STARTER',
    name: 'Starter',
    monthlyPrice: 19,
    yearlyPrice: 182,
    popular: false,
    features: [
      '1 Business Location',
      '10 AI Replies / month',
      '100 WhatsApp Requests / month',
      'Google & Yelp Integration',
      'Basic Analytics',
    ],
  },
  {
    key: 'GROWTH',
    name: 'Growth',
    monthlyPrice: 39,
    yearlyPrice: 374,
    popular: true,
    features: [
      '3 Business Locations',
      '50 AI Replies / month',
      '500 WhatsApp Requests / month',
      'All Platform Integrations',
      'Advanced Analytics',
      'Sentiment Analysis',
      '3 Competitor Tracking',
    ],
  },
  {
    key: 'PRO',
    name: 'Pro',
    monthlyPrice: 69,
    yearlyPrice: 662,
    popular: false,
    features: [
      '10 Business Locations',
      'Unlimited AI Replies',
      'Unlimited WhatsApp Requests',
      'All Platform Integrations',
      'Advanced Analytics & Reports',
      'Sentiment Analysis',
      '10 Competitor Tracking',
      'Priority Support',
    ],
  },
];

export default function PricingPage() {
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();

  const handleSubscribe = async (planKey: string) => {
    setLoadingPlan(planKey);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey, interval }),
      });
      const json = await res.json();

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (json.data?.url) {
        window.location.href = json.data.url;
      }
    } catch {
      // silently fail
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/dashboard" className="text-xl font-bold text-navy">
            ReviewHub
          </Link>
          <h1 className="text-4xl font-bold text-text-primary mt-6 mb-3">
            Choose Your Plan
          </h1>
          <p className="text-lg text-text-secondary max-w-xl mx-auto">
            Start with a 14-day free trial. No credit card required.
          </p>

          {/* Interval Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span
              className={`text-sm font-medium ${interval === 'monthly' ? 'text-text-primary' : 'text-text-secondary'}`}
            >
              Monthly
            </span>
            <button
              onClick={() => setInterval(interval === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                interval === 'yearly' ? 'bg-accent-blue' : 'bg-border'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  interval === 'yearly' ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${interval === 'yearly' ? 'text-text-primary' : 'text-text-secondary'}`}
            >
              Yearly
            </span>
            {interval === 'yearly' && (
              <span className="ml-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                Save 20%
              </span>
            )}
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-3 gap-6">
          {plans.map((plan) => {
            const price = interval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const perMonth = interval === 'yearly'
              ? Math.round(plan.yearlyPrice / 12)
              : plan.monthlyPrice;

            return (
              <div
                key={plan.key}
                className={`relative bg-surface rounded-2xl border-2 p-8 flex flex-col ${
                  plan.popular
                    ? 'border-accent-blue shadow-lg shadow-accent-blue/10'
                    : 'border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent-blue text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                      <Sparkles size={12} />
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold text-text-primary">{plan.name}</h3>

                <div className="mt-4 mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-navy">${perMonth}</span>
                    <span className="text-text-secondary text-sm">/month</span>
                  </div>
                  {interval === 'yearly' && (
                    <p className="text-xs text-text-secondary mt-1">
                      ${price}/year billed annually
                    </p>
                  )}
                </div>

                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.key)}
                  disabled={loadingPlan === plan.key}
                  className={`mt-8 w-full py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
                    plan.popular
                      ? 'bg-navy text-white hover:bg-navy-dark'
                      : 'bg-background text-text-primary border border-border hover:bg-border/50'
                  }`}
                >
                  {loadingPlan === plan.key ? 'Redirecting...' : 'Get Started'}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-text-secondary mt-8">
          All plans include a 14-day free trial.{' '}
          <Link href="/login" className="text-accent-blue hover:underline">
            Sign in
          </Link>{' '}
          to get started.
        </p>
      </div>
    </div>
  );
}
