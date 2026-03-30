'use client';

import { useState } from 'react';
import { TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';
import SentimentChart from '@/components/analytics/SentimentChart';
import RatingDistribution from '@/components/analytics/RatingDistribution';
import PlatformComparison from '@/components/analytics/PlatformComparison';
import TopKeywords from '@/components/analytics/TopKeywords';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'30d' | 'quarterly'>('30d');

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-8 bg-accent-blue rounded-full" />
            <h1 className="text-[28px] font-bold text-text-primary">Analytics</h1>
          </div>
          <p className="text-sm text-text-secondary mt-1 ml-[15px]">
            In-depth insights into sentiment trends, platform-specific performance, and common
            keywords.
          </p>
        </div>
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setPeriod('30d')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              period === '30d'
                ? 'bg-surface text-navy shadow-sm'
                : 'bg-background text-text-secondary hover:text-navy'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setPeriod('quarterly')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              period === 'quarterly'
                ? 'bg-surface text-navy shadow-sm'
                : 'bg-background text-text-secondary hover:text-navy'
            }`}
          >
            Quarterly
          </button>
        </div>
      </div>

      {/* Section 1: Sentiment Over Time */}
      <div className="mb-6">
        <SentimentChart />
      </div>

      {/* Section 2: Rating Distribution */}
      <div className="mb-6">
        <RatingDistribution />
      </div>

      {/* Section 3: Platform Comparison */}
      <div className="mb-6">
        <PlatformComparison />
      </div>

      {/* Section 4: Top Keywords */}
      <div className="mb-6">
        <TopKeywords />
      </div>

      {/* Bottom stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-surface rounded-xl shadow-sm border border-border p-6 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-accent-blue/10 flex items-center justify-center">
            <BarChart3 size={20} className="text-accent-blue" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary mb-0.5">
              Top Platform
            </p>
            <p className="text-base font-bold text-text-primary">Google Reviews</p>
            <p className="text-xs text-text-secondary">85% of total volume</p>
          </div>
        </div>

        <div className="bg-surface rounded-xl shadow-sm border border-border p-6 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-danger/10 flex items-center justify-center">
            <AlertTriangle size={20} className="text-danger" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary mb-0.5">
              Critical Action
            </p>
            <p className="text-base font-bold text-text-primary">9 Unread Negatives</p>
            <p className="text-xs text-text-secondary">Requires immediate attention</p>
          </div>
        </div>

        <div className="bg-surface rounded-xl shadow-sm border border-border p-6 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-navy/10 flex items-center justify-center">
            <TrendingUp size={20} className="text-navy" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary mb-0.5">
              Sentiment Trend
            </p>
            <p className="text-base font-bold text-text-primary">+4.2% Growth</p>
            <p className="text-xs text-text-secondary">Positive mentions increasing</p>
          </div>
        </div>
      </div>
    </div>
  );
}
