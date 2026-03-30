'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { sentimentTrend } from '@/data/mockData';

export default function SentimentChart() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === 'dark';
  const gridColor = isDark ? '#334155' : '#E2E8F0';
  const tickColor = isDark ? '#94A3B8' : '#718096';

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Sentiment Over Time</h2>
        <div className="flex items-center gap-4 text-xs text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-success inline-block rounded" /> Positive
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-danger inline-block rounded" /> Negative
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={sentimentTrend}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: tickColor }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: tickColor }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(value) => `${value}%`}
            contentStyle={{
              borderRadius: 8,
              border: `1px solid ${gridColor}`,
              fontSize: 13,
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              color: isDark ? '#F1F5F9' : '#1A202C',
            }}
          />
          <Line
            type="monotone"
            dataKey="positive"
            stroke="#27AE60"
            strokeWidth={2.5}
            dot={{ fill: '#27AE60', r: 4 }}
            activeDot={{ r: 6 }}
            name="Positive"
          />
          <Line
            type="monotone"
            dataKey="negative"
            stroke="#C0392B"
            strokeWidth={2.5}
            dot={{ fill: '#C0392B', r: 4 }}
            activeDot={{ r: 6 }}
            name="Negative"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
