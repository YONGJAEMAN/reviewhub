'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Calendar, AlertTriangle, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useBusinessContext } from '@/components/BusinessContext';
import KpiCard from '@/components/dashboard/KpiCard';
import ExportReportModal from '@/components/export/ExportReportModal';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const ReviewTrendChart = dynamic(() => import('@/components/dashboard/ReviewTrendChart'), {
  ssr: false,
  loading: () => <div className="bg-surface rounded-xl shadow-sm border border-border p-6 h-[320px] animate-pulse" />,
});
import PlatformPerformance from '@/components/dashboard/PlatformPerformance';
import RecentActivity from '@/components/dashboard/RecentActivity';
import type { KpiData, ChartDataPoint, Review, PlatformPerformanceData } from '@/types';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const [period, setPeriod] = useState('30');
  const [kpis, setKpis] = useState<KpiData[]>([]);
  const [chart, setChart] = useState<ChartDataPoint[]>([]);
  const [recentActivity, setRecentActivity] = useState<Review[]>([]);
  const [platformPerf, setPlatformPerf] = useState<PlatformPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [trialExpired, setTrialExpired] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const { activeBusiness } = useBusinessContext();
  const bid = activeBusiness?.businessId;
  const tourStarted = useRef(false);

  useEffect(() => {
    if (!bid) return;
    setLoading(true);
    fetch(`/api/dashboard?period=${period}&businessId=${bid}`)
      .then((res) => res.json())
      .then((json) => {
        setKpis(json.data.kpi);
        setChart(json.data.chart);
        setRecentActivity(json.data.recentActivity);
        setPlatformPerf(json.data.platformPerformance);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period, bid]);

  useEffect(() => {
    if (!bid) return;
    fetch(`/api/subscription?businessId=${bid}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.trialExpired && json.data?.plan === 'FREE') {
          setTrialExpired(true);
        }
      })
      .catch(() => {});
  }, [bid]);

  // Guided tour for first-time users
  useEffect(() => {
    if (loading || tourStarted.current) return;
    if (localStorage.getItem('reviewhub_tour_seen')) return;
    tourStarted.current = true;

    const d = driver({
      showProgress: true,
      animate: true,
      steps: [
        {
          element: '[data-tour="kpi"]',
          popover: {
            title: 'KPI 한눈에 보기',
            description: '총 리뷰 수, 평균 평점 등 핵심 지표를 실시간으로 확인하세요.',
          },
        },
        {
          element: '[data-tour="chart"]',
          popover: {
            title: '리뷰 트렌드',
            description: '기간별 리뷰 추이를 차트로 확인할 수 있습니다.',
          },
        },
        {
          element: '[data-tour="platform"]',
          popover: {
            title: '플랫폼별 성과',
            description: 'Google, Yelp 등 각 플랫폼별 리뷰 현황을 비교하세요.',
          },
        },
        {
          element: '[data-tour="activity"]',
          popover: {
            title: '최근 활동',
            description: '최근 등록된 리뷰를 바로 확인하고 대응할 수 있습니다.',
          },
        },
      ],
      onDestroyed: () => {
        localStorage.setItem('reviewhub_tour_seen', 'true');
      },
    });
    d.drive();
  }, [loading]);

  if (loading && kpis.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {trialExpired && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6">
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800 flex-1">
            Your free trial has ended. Subscribe to continue using all features.
          </p>
          <Link
            href="/pricing"
            className="shrink-0 bg-navy text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-navy-dark transition-colors"
          >
            Choose Plan
          </Link>
        </div>
      )}

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
            className="flex items-center gap-2 border border-border rounded-lg px-4 py-2.5 bg-surface text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <Download size={16} />
            {t('export')}
          </button>
          <div className="flex items-center gap-2 border border-border rounded-lg px-4 py-2.5 bg-surface text-sm">
            <Calendar size={16} className="text-text-secondary" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent focus:outline-none font-medium text-text-primary"
            >
              <option value="7">{t('period.7')}</option>
              <option value="30">{t('period.30')}</option>
              <option value="90">{t('period.90')}</option>
              <option value="365">This Year</option>
            </select>
          </div>
        </div>
      </div>

      <div data-tour="kpi" className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} data={kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div data-tour="chart" className="md:col-span-2">
          <ReviewTrendChart data={chart} />
        </div>
        <div data-tour="platform">
          <PlatformPerformance data={platformPerf} />
        </div>
      </div>

      <div data-tour="activity">
        <RecentActivity data={recentActivity} />
      </div>

      {showExport && <ExportReportModal onClose={() => setShowExport(false)} />}
    </div>
  );
}
