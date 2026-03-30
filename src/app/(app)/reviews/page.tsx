'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ReviewCard from '@/components/reviews/ReviewCard';
import ReviewFilters, { type FilterState, type SortOption } from '@/components/reviews/ReviewFilters';
import Pagination from '@/components/reviews/Pagination';
import ReplyModal from '@/components/reviews/ReplyModal';
import { reviews as initialReviews } from '@/data/mockData';
import type { Review } from '@/types';

const sortOrder: Record<string, number> = {
  '2 hours ago': 1,
  '5 hours ago': 2,
  '1 day ago': 3,
  '2 days ago': 4,
  '3 days ago': 5,
  '4 days ago': 6,
};

export default function ReviewsPage() {
  return (
    <Suspense>
      <ReviewsContent />
    </Suspense>
  );
}

function ReviewsContent() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const [reviewList, setReviewList] = useState<Review[]>(initialReviews);
  const [filters, setFilters] = useState<FilterState>({
    platform: 'all',
    rating: 'all',
    status: 'all',
  });
  const [sort, setSort] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [replyTarget, setReplyTarget] = useState<Review | null>(null);

  useEffect(() => {
    if (highlightId) {
      const el = document.getElementById(`review-${highlightId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightId]);

  const filtered = useMemo(() => {
    let result = reviewList.filter((r) => {
      if (filters.platform !== 'all' && r.platform !== filters.platform) return false;
      if (filters.rating !== 'all' && r.rating !== Number(filters.rating)) return false;
      if (filters.status !== 'all' && r.status !== filters.status) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return (sortOrder[a.postedAt] ?? 99) - (sortOrder[b.postedAt] ?? 99);
        case 'oldest':
          return (sortOrder[b.postedAt] ?? 0) - (sortOrder[a.postedAt] ?? 0);
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    return result;
  }, [reviewList, filters, sort]);

  const avgRating =
    reviewList.length > 0
      ? (reviewList.reduce((sum, r) => sum + r.rating, 0) / reviewList.length).toFixed(1)
      : '0';

  const handleSendReply = (reviewId: string, replyContent: string) => {
    setReviewList((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              status: 'replied' as const,
              reply: { content: replyContent, repliedAt: 'Just now' },
            }
          : r
      )
    );
    setReplyTarget(null);
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-text-primary">Review Feed</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage and respond to feedback across all connected channels.
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary">
              Average Rating
            </span>
            <p className="text-lg font-bold text-navy">
              {avgRating} <span className="text-warning">★</span>
            </p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div>
            <span className="text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary">
              Total Reviews
            </span>
            <p className="text-lg font-bold text-navy">1,284</p>
          </div>
        </div>
      </div>

      <ReviewFilters
        filters={filters}
        sort={sort}
        onChange={setFilters}
        onSortChange={setSort}
      />

      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((review) => (
            <div key={review.id} id={`review-${review.id}`}>
              <ReviewCard
                review={review}
                onReply={setReplyTarget}
                highlight={highlightId === review.id}
              />
            </div>
          ))
        ) : (
          <div className="bg-surface rounded-xl shadow-sm border border-border p-12 text-center">
            <p className="text-text-secondary">No reviews match your filters.</p>
          </div>
        )}
      </div>

      <Pagination current={currentPage} total={24} onChange={setCurrentPage} />

      {replyTarget && (
        <ReplyModal
          review={replyTarget}
          onClose={() => setReplyTarget(null)}
          onSend={handleSendReply}
        />
      )}
    </div>
  );
}
