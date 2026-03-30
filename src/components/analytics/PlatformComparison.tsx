import { platformComparison } from '@/data/mockData';
import { formatNumber } from '@/lib/utils';
import { Star, MessageSquare, Clock, Reply } from 'lucide-react';

const platformIcons: Record<string, { letter: string }> = {
  google: { letter: 'G' },
  yelp: { letter: 'Y' },
  facebook: { letter: 'f' },
  whatsapp: { letter: 'W' },
};

export default function PlatformComparison() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary mb-4">Platform Comparison</h2>
      <div className="grid grid-cols-4 gap-4">
        {platformComparison.map((p) => {
          const icon = platformIcons[p.platform];
          return (
            <div
              key={p.platform}
              className="bg-surface rounded-xl shadow-sm border border-border p-5"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: p.color }}
                >
                  {icon.letter}
                </div>
                <span className="text-base font-semibold text-text-primary">{p.name}</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <Star size={13} />
                    Avg Rating
                  </div>
                  <span className="text-sm font-bold text-navy">{p.rating}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <MessageSquare size={13} />
                    Reviews
                  </div>
                  <span className="text-sm font-bold text-text-primary">
                    {formatNumber(p.totalReviews)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <Reply size={13} />
                    Response Rate
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      p.responseRate >= 90
                        ? 'text-success'
                        : p.responseRate >= 80
                          ? 'text-navy'
                          : 'text-warning'
                    }`}
                  >
                    {p.responseRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <Clock size={13} />
                    Avg Response
                  </div>
                  <span className="text-sm font-bold text-text-primary">
                    {p.avgResponseTime}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
