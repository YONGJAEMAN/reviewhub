'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { formatNumber } from '@/lib/utils';
import type { RatingDistItem } from '@/types';

interface Props {
  data: RatingDistItem[];
}

export default function RatingDistribution({ data }: Props) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === 'dark';

  const getBarColor = (stars: number) => {
    if (stars >= 4) return isDark ? '#60A5FA' : '#1B3A4B';
    if (stars === 3) return '#D4A017';
    return '#C0392B';
  };

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-6">Rating Distribution</h2>
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.stars} className="flex items-center gap-3">
            <span className="w-8 text-sm font-semibold text-text-primary text-right">
              {item.stars}★
            </span>
            <div className="flex-1 h-3 bg-background rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: getBarColor(item.stars),
                }}
              />
            </div>
            <div className="w-24 text-right flex items-center justify-end gap-2">
              <span className="text-sm font-semibold text-text-primary">{item.percentage}%</span>
              <span className="text-xs text-text-secondary">({formatNumber(item.count)})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
