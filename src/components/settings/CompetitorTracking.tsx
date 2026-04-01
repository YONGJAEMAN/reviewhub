'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Trophy, Star } from 'lucide-react';
import { useBusinessContext } from '@/components/BusinessContext';

interface Competitor {
  id: string;
  name: string;
  googlePlaceId: string;
  address: string | null;
  rating: number | null;
  totalReviews: number | null;
}

interface SearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating: number | null;
  user_ratings_total: number | null;
}

export default function CompetitorTracking() {
  const { activeBusiness } = useBusinessContext();
  const bid = activeBusiness?.businessId;
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bid) return;
    fetch(`/api/competitors?businessId=${bid}`)
      .then((r) => r.json())
      .then((j) => setCompetitors(j.data ?? []))
      .catch(console.error);
  }, [bid]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setError('');
    try {
      const res = await fetch(`/api/competitors/search?q=${encodeURIComponent(searchQuery)}`);
      const json = await res.json();
      setSearchResults(json.data ?? []);
    } catch {
      setError('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async (result: SearchResult) => {
    if (!bid) return;
    setError('');
    try {
      const res = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: bid,
          name: result.name,
          googlePlaceId: result.place_id,
          address: result.formatted_address,
          rating: result.rating,
          totalReviews: result.user_ratings_total,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Failed to add');
        return;
      }
      setCompetitors((prev) => [...prev, json.data]);
      setSearchResults((prev) => prev.filter((r) => r.place_id !== result.place_id));
    } catch {
      setError('Failed to add competitor');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/competitors/${id}`, { method: 'DELETE' });
      setCompetitors((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError('Failed to remove');
    }
  };

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy size={20} className="text-accent-blue" />
          <h3 className="text-lg font-semibold text-text-primary">Competitor Tracking</h3>
        </div>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center gap-1 text-sm text-accent-blue hover:underline"
        >
          <Plus size={16} /> Add Competitor
        </button>
      </div>

      {error && (
        <p className="text-sm text-danger mb-3">{error}</p>
      )}

      {showSearch && (
        <div className="mb-4 p-4 bg-background rounded-lg border border-border">
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search businesses (e.g. 'coffee shops in Seoul')"
                className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-surface focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-4 py-2 bg-navy text-white text-sm rounded-lg hover:bg-navy/90 disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map((r) => (
                <div key={r.place_id} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{r.name}</p>
                    <p className="text-xs text-text-secondary">{r.formatted_address}</p>
                    {r.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-text-secondary">{r.rating} ({r.user_ratings_total} reviews)</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleAdd(r)}
                    className="p-2 text-accent-blue hover:bg-accent-blue/10 rounded-lg"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {competitors.length === 0 ? (
        <p className="text-sm text-text-secondary text-center py-6">
          No competitors tracked yet. Add competitors to compare performance.
        </p>
      ) : (
        <div className="space-y-3">
          {competitors.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium text-text-primary">{c.name}</p>
                {c.address && <p className="text-xs text-text-secondary">{c.address}</p>}
                <div className="flex items-center gap-3 mt-1">
                  {c.rating && (
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-text-secondary">{c.rating}</span>
                    </div>
                  )}
                  {c.totalReviews != null && (
                    <span className="text-xs text-text-secondary">{c.totalReviews} reviews</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                className="p-2 text-text-secondary hover:text-danger rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
