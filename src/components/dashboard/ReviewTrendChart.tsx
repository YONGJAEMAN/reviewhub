'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ChartDataPoint } from '@/types';

interface Props {
  data: ChartDataPoint[];
}

export default function ReviewTrendChart({ data }: Props) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === 'dark';
  const gridColor = isDark ? '#334155' : '#E2E8F0';
  const tickColor = isDark ? '#94A3B8' : '#718096';
  const barPrimary = isDark ? '#60A5FA' : '#1B3A4B';
  const barSecondary = isDark ? '#475569' : '#CBD5E0';

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Review Acquisition Trend</h2>
        <div className="flex items-center gap-4 text-xs text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-navy inline-block" /> This Month
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-border inline-block" /> Last Month
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis dataKey="week" tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: `1px solid ${gridColor}`,
              fontSize: 13,
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              color: isDark ? '#F1F5F9' : '#1A202C',
            }}
          />
          <Bar dataKey="thisMonth" fill={barPrimary} radius={[4, 4, 0, 0]} barSize={28} name="This Period" />
          <Bar dataKey="lastMonth" fill={barSecondary} radius={[4, 4, 0, 0]} barSize={28} name="Previous Period" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
