'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useBusinessContext } from '@/components/BusinessContext';
import ReviewCard from '@/components/reviews/ReviewCard';
import ReviewFilters, { type FilterState, type SortOption } from '@/components/reviews/ReviewFilters';
import Pagination from '@/components/reviews/Pagination';
import ReplyModal from '@/components/reviews/ReplyModal';
import type { Review } from '@/types';

export default function ReviewsPage() {
  return (
    <Suspense>
      <ReviewsContent />
    </Suspense>
  );
}

function ReviewsContent() {
  const t = useTranslations('reviews');
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const [reviewList, setReviewList] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    platform: 'all',
    rating: 'all',
    status: 'all',
  });
  const [sort, setSort] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [replyTarget, setReplyTarget] = useState<Review | null>(null);
  const { activeBusiness } = useBusinessContext();
  const bid = activeBusiness?.businessId;

  const fetchReviews = useCallback(() => {
    if (!bid) return;
    const params = new URLSearchParams();
    params.set('businessId', bid);
    if (filters.platform !== 'all') params.set('platform', filters.platform);
    if (filters.rating !== 'all') params.set('rating', filters.rating);
    if (filters.status !== 'all') params.set('status', filters.status);

    const sortMap: Record<SortOption, { field: string; order: string }> = {
      newest: { field: 'postedAt', order: 'desc' },
      oldest: { field: 'postedAt', order: 'asc' },
      highest: { field: 'rating', order: 'desc' },
      lowest: { field: 'rating', order: 'asc' },
    };
    const s = sortMap[sort];
    params.set('sortField', s.field);
    params.set('sortOrder', s.order);
    params.set('page', String(currentPage));
    params.set('limit', '10');

    setLoading(true);
    fetch(`/api/reviews?${params}`)
      .then((res) => res.json())
      .then((json) => {
        setReviewList(json.data.data);
        setTotal(json.data.total);
        setTotalPages(json.data.totalPages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters, sort, currentPage, bid]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (highlightId) {
      const el = document.getElementById(`review-${highlightId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightId, reviewList]);

  const avgRating =
    reviewList.length > 0
      ? (reviewList.reduce((sum, r) => sum + r.rating, 0) / reviewList.length).toFixed(1)
      : '0';

  const handleSendReply = (reviewId: string, replyContent: string) => {
    fetch(`/api/reviews/${reviewId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: replyContent }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setReviewList((prev) =>
            prev.map((r) => (r.id === reviewId ? json.data : r))
          );
        }
      })
      .catch(console.error);
    setReplyTarget(null);
  };

  if (loading && reviewList.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-text-primary">{t('title')}</h1>
          <p className="text-sm text-text-secondary mt-1">
            {t('subtitle')}
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
            <p className="text-lg font-bold text-navy">{total.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <ReviewFilters
        filters={filters}
        sort={sort}
        onChange={(f) => { setFilters(f); setCurrentPage(1); }}
        onSortChange={setSort}
      />

      <div className="space-y-4">
        {reviewList.length > 0 ? (
          reviewList.map((review) => (
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
            <p className="text-text-secondary">{t('noReviews')}</p>
          </div>
        )}
      </div>

      <Pagination current={currentPage} total={totalPages} onChange={setCurrentPage} />

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
