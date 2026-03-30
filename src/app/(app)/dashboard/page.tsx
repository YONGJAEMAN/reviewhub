'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import KpiCard from '@/components/dashboard/KpiCard';
import ReviewTrendChart from '@/components/dashboard/ReviewTrendChart';
import PlatformPerformance from '@/components/dashboard/PlatformPerformance';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { kpiByPeriod, chartByPeriod } from '@/data/mockData';

export default function DashboardPage() {
  const [period, setPeriod] = useState('30');

  const kpis = kpiByPeriod[period] ?? kpiByPeriod['30'];
  const chart = chartByPeriod[period] ?? chartByPeriod['30'];

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-8 bg-accent-blue rounded-full" />
            <h1 className="text-[28px] font-bold text-text-primary">Dashboard</h1>
          </div>
          <p className="text-sm text-text-secondary mt-1 ml-[15px]">
            Real-time overview of your business reputation across all networks.
          </p>
        </div>
        <div className="flex items-center gap-2 border border-border rounded-lg px-4 py-2.5 bg-surface text-sm">
          <Calendar size={16} className="text-text-secondary" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-transparent focus:outline-none font-medium text-text-primary"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">This Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} data={kpi} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2">
          <ReviewTrendChart data={chart} />
        </div>
        <PlatformPerformance />
      </div>

      <RecentActivity />
    </div>
  );
}
