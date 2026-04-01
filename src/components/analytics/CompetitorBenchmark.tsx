'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Sparkles } from 'lucide-react';
import { useBusinessContext } from '@/components/BusinessContext';

interface BenchmarkData {
  myBusiness: { name: string; avgRating: number; totalReviews: number };
  competitors: Array<{
    id: string;
    name: string;
    rating: number | null;
    totalReviews: number | null;
  }>;
}

export default function CompetitorBenchmark() {
  const { activeBusiness } = useBusinessContext();
  const bid = activeBusiness?.businessId;
  const [data, setData] = useState<BenchmarkData | null>(null);
  const [insights, setInsights] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bid) return;
    fetch(`/api/competitors?businessId=${bid}&mode=benchmark`)
      .then((r) => r.json())
      .then((j) => setData(j.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bid]);

  const fetchInsights = async () => {
    if (!bid) return;
    setLoadingInsights(true);
    try {
      const res = await fetch(`/api/competitors/insights?businessId=${bid}`);
      const json = await res.json();
      setInsights(json.data?.insights ?? 'Unable to generate insights.');
    } catch {
      setInsights('Failed to load insights.');
    } finally {
      setLoadingInsights(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
        <div className="animate-pulse h-40 bg-background rounded-lg" />
      </div>
    );
  }

  if (!data || data.competitors.length === 0) {
    return (
      <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={20} className="text-accent-blue" />
          <h3 className="text-lg font-semibold text-text-primary">Competitor Benchmark</h3>
        </div>
        <p className="text-sm text-text-secondary text-center py-8">
          No competitors tracked yet. Add competitors in Settings to see benchmark data.
        </p>
      </div>
    );
  }

  const allEntries = [
    { name: data.myBusiness.name, rating: data.myBusiness.avgRating, reviews: data.myBusiness.totalReviews, isYou: true },
    ...data.competitors.map((c) => ({ name: c.name, rating: c.rating ?? 0, reviews: c.totalReviews ?? 0, isYou: false })),
  ].sort((a, b) => b.rating - a.rating);

  const maxReviews = Math.max(...allEntries.map((e) => e.reviews), 1);

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy size={20} className="text-accent-blue" />
          <h3 className="text-lg font-semibold text-text-primary">Competitor Benchmark</h3>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loadingInsights}
          className="flex items-center gap-1 text-sm text-accent-blue hover:underline disabled:opacity-50"
        >
          <Sparkles size={14} />
          {loadingInsights ? 'Analyzing...' : 'AI Insights'}
        </button>
      </div>

      <div className="space-y-3">
        {allEntries.map((entry, i) => (
          <div
            key={entry.name}
            className={`flex items-center gap-4 p-3 rounded-lg border ${
              entry.isYou ? 'bg-accent-blue/5 border-accent-blue/20' : 'bg-background border-border'
            }`}
          >
            <span className="w-6 text-center text-sm font-bold text-text-secondary">#{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-text-primary truncate">{entry.name}</p>
                {entry.isYou && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-accent-blue/10 text-accent-blue rounded">YOU</span>
                )}
              </div>
              <div className="mt-1 h-2 bg-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${entry.isYou ? 'bg-accent-blue' : 'bg-text-secondary/30'}`}
                  style={{ width: `${(entry.reviews / maxReviews) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold text-text-primary">{entry.rating.toFixed(1)}</span>
              </div>
              <p className="text-[10px] text-text-secondary">{entry.reviews} reviews</p>
            </div>
          </div>
        ))}
      </div>

      {insights && (
        <div className="mt-6 p-4 bg-accent-blue/5 rounded-lg border border-accent-blue/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-accent-blue" />
            <p className="text-sm font-semibold text-text-primary">AI Insights</p>
          </div>
          <div className="text-sm text-text-secondary whitespace-pre-wrap">{insights}</div>
        </div>
      )}
    </div>
  );
}
