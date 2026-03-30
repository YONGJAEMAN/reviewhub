'use client';

import { useState } from 'react';
import { topKeywords } from '@/data/mockData';

const maxCount = Math.max(...topKeywords.map((k) => k.count));

function getSizeClass(count: number): string {
  const ratio = count / maxCount;
  if (ratio > 0.8) return 'text-[26px] font-bold';
  if (ratio > 0.6) return 'text-[22px] font-bold';
  if (ratio > 0.4) return 'text-[18px] font-semibold';
  if (ratio > 0.25) return 'text-[15px] font-medium';
  return 'text-[13px] font-medium';
}

function getColor(count: number): string {
  const ratio = count / maxCount;
  if (ratio > 0.7) return 'text-navy';
  if (ratio > 0.4) return 'text-steel';
  return 'text-text-secondary';
}

export default function TopKeywords() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-6">Top Keywords</h2>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 min-h-[180px]">
        {topKeywords.map((kw) => (
          <button
            key={kw.keyword}
            onClick={() => setSelected(selected === kw.keyword ? null : kw.keyword)}
            className={`relative transition-all hover:scale-105 ${getSizeClass(kw.count)} ${
              selected === kw.keyword ? 'text-accent-blue' : getColor(kw.count)
            }`}
          >
            {kw.keyword}
            {selected === kw.keyword && (
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-navy text-white text-[10px] font-semibold rounded-full px-2 py-0.5 whitespace-nowrap">
                {kw.count} reviews
              </span>
            )}
          </button>
        ))}
      </div>
      {selected && (
        <p className="text-center text-xs text-text-secondary mt-4 pt-4 border-t border-border">
          &ldquo;{selected}&rdquo; appears in{' '}
          <span className="font-semibold text-navy">
            {topKeywords.find((k) => k.keyword === selected)?.count}
          </span>{' '}
          reviews
        </p>
      )}
    </div>
  );
}
