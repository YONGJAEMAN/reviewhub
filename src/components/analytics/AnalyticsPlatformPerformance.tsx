import { analyticsPlatforms } from '@/data/mockData';

const platformIcons: Record<string, { letter: string; bg: string }> = {
  google: { letter: 'G', bg: '#4285F4' },
  yelp: { letter: 'Y', bg: '#D32323' },
  facebook: { letter: 'f', bg: '#1877F2' },
  whatsapp: { letter: 'W', bg: '#25D366' },
};

export default function AnalyticsPlatformPerformance() {
  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
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
      <div className="space-y-5">
        {analyticsPlatforms.map((p) => {
          const icon = platformIcons[p.platform];
          return (
            <div key={p.platform}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: icon.bg }}
                  >
                    {icon.letter}
                  </div>
                  <span className="text-sm font-medium text-text-primary capitalize">
                    {p.platform}
                  </span>
                </div>
                <span className="text-sm font-bold text-navy">{p.rating} ★</span>
              </div>
              <div className="h-2 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(p.reviewVolume / p.maxVolume) * 100}%`,
                    backgroundColor: '#1B3A4B',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
