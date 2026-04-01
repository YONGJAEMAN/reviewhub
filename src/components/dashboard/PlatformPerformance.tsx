import Link from 'next/link';
import { formatNumber } from '@/lib/utils';
import type { PlatformPerformanceData } from '@/types';

const platformIcons: Record<string, { letter: string; bg: string }> = {
  google: { letter: 'G', bg: '#4285F4' },
  yelp: { letter: 'Y', bg: '#D32323' },
  facebook: { letter: 'f', bg: '#1877F2' },
  whatsapp: { letter: 'W', bg: '#25D366' },
};

interface Props {
  data: PlatformPerformanceData[];
}

export default function PlatformPerformance({ data }: Props) {
  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Platform Performance</h2>
        <div className="flex items-center gap-3 text-[11px] text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-navy" /> Reviews
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-warning" /> Avg Rating
          </span>
        </div>
      </div>
      <div className="space-y-4 flex-1">
        {data.map((p) => {
          const icon = platformIcons[p.platform];
          return (
            <div key={p.platform}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: icon?.bg ?? p.color }}
                  >
                    {icon?.letter ?? p.platform[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-text-primary capitalize">
                    {p.platform}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-bold text-navy">{p.rating}</span>
                  <span className="text-text-secondary ml-1">
                    ({formatNumber(p.reviews)} reviews)
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(p.rating / 5) * 100}%`,
                    backgroundColor: icon?.bg ?? p.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <Link
        href="/reviews"
        className="inline-block mt-6 pt-4 border-t border-border text-sm font-medium text-text-secondary hover:text-navy text-center transition-colors"
      >
        View Detailed Metrics
      </Link>
    </div>
  );
}
