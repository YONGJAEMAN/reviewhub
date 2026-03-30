'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  current: number;
  total: number;
  onChange: (page: number) => void;
}

export default function Pagination({ current, total, onChange }: Props) {
  const pages: (number | string)[] = [];

  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 2) pages.push('...');
    pages.push(total);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        className="p-2 text-text-secondary hover:text-navy disabled:opacity-30 transition-colors"
      >
        <ChevronLeft size={18} />
      </button>

      {pages.map((page, i) =>
        typeof page === 'string' ? (
          <span key={`dots-${i}`} className="px-2 text-text-secondary text-sm">
            {page}
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onChange(page)}
            className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
              page === current
                ? 'bg-navy text-white'
                : 'text-text-secondary hover:bg-background'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current === total}
        className="p-2 text-text-secondary hover:text-navy disabled:opacity-30 transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
