'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { sentimentData } from '@/data/mockData';
import { Contrast } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export default function SentimentAnalysis() {
  const data = [
    { name: 'Positive', value: sentimentData.positive, color: '#1B3A4B' },
    { name: 'Neutral', value: sentimentData.neutral, color: '#CBD5E0' },
    { name: 'Negative', value: sentimentData.negative, color: '#E2E8F0' },
  ];

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-text-primary">Sentiment Analysis</h2>
        <Contrast size={20} className="text-navy" />
      </div>

      <div className="flex justify-center my-4">
        <div className="relative w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-navy">{sentimentData.percentage}%</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
              Positive
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary mb-1">
            Positive
          </p>
          <p className="text-lg font-bold text-navy">{formatNumber(sentimentData.positive)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary mb-1">
            Neutral
          </p>
          <p className="text-lg font-bold text-text-primary">{formatNumber(sentimentData.neutral)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary mb-1">
            Negative
          </p>
          <p className="text-lg font-bold text-danger">{formatNumber(sentimentData.negative)}</p>
        </div>
      </div>
    </div>
  );
}
