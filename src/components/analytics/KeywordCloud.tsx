import { keywordCloud } from '@/data/mockData';

const sentimentColors: Record<string, string> = {
  positive: 'text-navy',
  neutral: 'text-text-secondary',
  negative: 'text-danger',
};

export default function KeywordCloud() {
  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-6">Keyword Cloud</h2>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 min-h-[160px]">
        {keywordCloud.map((kw) => {
          const isBordered = ['Reliable', 'Pricey'].includes(kw.word);
          return (
            <span
              key={kw.word}
              className={`${sentimentColors[kw.sentiment]} font-semibold ${
                isBordered ? 'border border-border rounded-full px-3 py-1' : ''
              }`}
              style={{ fontSize: `${kw.size}px` }}
            >
              {kw.word}
            </span>
          );
        })}
      </div>
    </div>
  );
}
