'use client';

import { SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
import type { Platform, ReviewStatus } from '@/types';

export type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

export interface FilterState {
  platform: Platform | 'all';
  rating: string;
  status: ReviewStatus | 'all';
}

interface Props {
  filters: FilterState;
  sort: SortOption;
  onChange: (filters: FilterState) => void;
  onSortChange: (sort: SortOption) => void;
}

export default function ReviewFilters({ filters, sort, onChange, onSortChange }: Props) {
  const hasFilters =
    filters.platform !== 'all' || filters.rating !== 'all' || filters.status !== 'all';

  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex items-center gap-2 text-sm font-medium text-text-primary border border-border rounded-lg px-3 py-2.5">
        <SlidersHorizontal size={16} />
        Filters
      </div>

      <select
        value={filters.platform}
        onChange={(e) => onChange({ ...filters, platform: e.target.value as FilterState['platform'] })}
        className="bg-surface text-text-primary border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
      >
        <option value="all">All Platforms</option>
        <option value="google">Google</option>
        <option value="yelp">Yelp</option>
        <option value="facebook">Facebook</option>
        <option value="whatsapp">WhatsApp</option>
      </select>

      <select
        value={filters.rating}
        onChange={(e) => onChange({ ...filters, rating: e.target.value })}
        className="bg-surface text-text-primary border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
      >
        <option value="all">All Ratings</option>
        <option value="5">5 Stars</option>
        <option value="4">4 Stars</option>
        <option value="3">3 Stars</option>
        <option value="2">2 Stars</option>
        <option value="1">1 Star</option>
      </select>

      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value as FilterState['status'] })}
        className="bg-surface text-text-primary border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
      >
        <option value="all">All Status</option>
        <option value="action_required">Action Required</option>
        <option value="high_priority">High Priority</option>
        <option value="replied">Replied</option>
      </select>

      <div className="flex items-center gap-1.5 border border-border rounded-lg px-3 py-2.5 text-sm">
        <ArrowUpDown size={14} className="text-text-secondary" />
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="bg-transparent focus:outline-none text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      {hasFilters && (
        <button
          onClick={() => onChange({ platform: 'all', rating: 'all', status: 'all' })}
          className="flex items-center gap-1 text-sm text-text-secondary hover:text-danger transition-colors ml-auto"
        >
          <X size={14} />
          Clear all
        </button>
      )}
    </div>
  );
}
