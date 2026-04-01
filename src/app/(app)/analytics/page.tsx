'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TrendingUp, AlertTriangle, BarChart3, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useBusinessContext } from '@/components/BusinessContext';
import ExportReportModal from '@/components/export/ExportReportModal';

const SentimentChart = dynamic(() => import('@/components/analytics/SentimentChart'), {
  ssr: false,
  loading: () => <div className="bg-surface rounded-xl shadow-sm border border-border p-6 h-[340px] animate-pulse" />,
});
import RatingDistribution from '@/components/analytics/RatingDistribution';
import PlatformComparison from '@/components/analytics/PlatformComparison';
import TopKeywords from '@/components/analytics/TopKeywords';
import CompetitorBenchmark from '@/components/analytics/CompetitorBenchmark';
import type {
  SentimentTrendPoint,
  RatingDistItem,
  PlatformComparisonData,
  TopKeyword,
} from '@/types';

export default function AnalyticsPage() {
  const t = useTranslations('analytics');
  const [period, setPeriod] = useState<'30d' | 'quarterly'>('30d');
  const [sentimentTrend, setSentimentTrend] = useState<SentimentTrendPoint[]>([]);
  const [ratingDist, setRatingDist] = useState<RatingDistItem[]>([]);
  const [platformComp, setPlatformComp] = useState<PlatformComparisonData[]>([]);
  const [keywords, setKeywords] = useState<TopKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExport, setShowExport] = useState(false);
  const { activeBusiness } = useBusinessContext();
  const bid = activeBusiness?.businessId;

  useEffect(() => {
    if (!bid) return;
    fetch(`/api/analytics?businessId=${bid}`)
      .then((res) => res.json())
      .then((json) => {
        setSentimentTrend(json.data.sentimentTrend);
        setRatingDist(json.data.ratingDistribution);
        setPlatformComp(json.data.platformComparison);
        setKeywords(json.data.topKeywords);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-8 bg-accent-blue rounded-full" />
            <h1 className="text-[28px] font-bold text-text-primary">{t('title')}</h1>
          </div>
          <p className="text-sm text-text-secondary mt-1 ml-[15px]">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-2 border border-border rounded-lg px-4 py-2 bg-surface text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <Download size={16} />
          </button>
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
      </div>

      {/* Section 1: Sentiment Over Time */}
      <div className="mb-6">
        <SentimentChart data={sentimentTrend} />
      </div>

      {/* Section 2: Rating Distribution */}
      <div className="mb-6">
        <RatingDistribution data={ratingDist} />
      </div>

      {/* Section 3: Platform Comparison */}
      <div className="mb-6">
        <PlatformComparison data={platformComp} />
      </div>

      {/* Section 4: Top Keywords */}
      <div className="mb-6">
        <TopKeywords data={keywords} />
      </div>

      {/* Section 5: Competitor Benchmark */}
      <div className="mb-6">
        <CompetitorBenchmark />
      </div>

      {/* Bottom stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {showExport && <ExportReportModal onClose={() => setShowExport(false)} />}
    </div>
  );
}
