'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Search, Bell, Moon, Sun } from 'lucide-react';
import { reviews } from '@/data/mockData';
import { renderStars } from '@/lib/utils';

export default function TopBar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const results = debouncedQuery.trim()
    ? reviews
        .filter((r) => {
          const q = debouncedQuery.toLowerCase();
          return (
            r.authorName.toLowerCase().includes(q) ||
            (r.title?.toLowerCase().includes(q) ?? false) ||
            r.content.toLowerCase().includes(q)
          );
        })
        .slice(0, 5)
    : [];

  const handleSelect = (reviewId: string) => {
    setQuery('');
    setShowResults(false);
    router.push(`/reviews?highlight=${reviewId}`);
  };

  return (
    <header className="sticky top-0 z-10 bg-surface border-b border-border px-8 py-3 flex items-center justify-between">
      <div ref={wrapperRef} className="relative w-96">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Search reviews, customers, or keywords..."
          className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue"
        />

        {showResults && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-surface rounded-xl border border-border shadow-lg overflow-hidden z-50">
            {results.map((r) => (
              <button
                key={r.id}
                onClick={() => handleSelect(r.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-background transition-colors text-left"
              >
                {r.authorAvatar ? (
                  <img
                    src={r.authorAvatar}
                    alt={r.authorName}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-steel text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {r.authorInitials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">{r.authorName}</span>
                    <span className="text-xs text-warning">{renderStars(r.rating)}</span>
                  </div>
                  <p className="text-xs text-text-secondary truncate">
                    {(r.title || r.content).slice(0, 50)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {showResults && debouncedQuery.trim() && results.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-surface rounded-xl border border-border shadow-lg p-4 z-50">
            <p className="text-sm text-text-secondary text-center">No results found</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Dark mode toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}

        <button className="relative p-2 text-text-secondary hover:text-navy transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-surface" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-navy text-surface flex items-center justify-center text-sm font-bold dark:bg-accent-blue dark:text-background">
            JM
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-text-primary leading-tight">James Miller</p>
            <p className="text-xs text-text-secondary leading-tight">Owner</p>
          </div>
        </div>
      </div>
    </header>
  );
}
