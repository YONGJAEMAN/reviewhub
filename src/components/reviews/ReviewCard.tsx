'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Review } from '@/types';
import { renderStars, ratingLabel, platformLabel } from '@/lib/utils';
import { platformConfig } from '@/lib/platformConfig';
import { Calendar, Reply, CheckCircle, Send, ExternalLink, Archive } from 'lucide-react';

function StatusBadge({ status }: { status: Review['status'] }) {
  switch (status) {
    case 'action_required':
      return (
        <span className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase bg-navy text-white tracking-wide">
          Action Required
        </span>
      );
    case 'high_priority':
      return (
        <span className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase bg-danger text-white tracking-wide">
          High Priority
        </span>
      );
    case 'replied':
      return (
        <span className="flex items-center gap-1.5 rounded-full border border-success/30 px-3 py-1 text-[10px] font-semibold uppercase text-success tracking-wide">
          <CheckCircle size={12} />
          Replied
        </span>
      );
  }
}

interface Props {
  review: Review;
  onReply?: (review: Review) => void;
  highlight?: boolean;
}

export default function ReviewCard({ review, onReply, highlight }: Props) {
  const router = useRouter();
  const isHighPriority = review.status === 'high_priority';
  const pIcon = platformConfig[review.platform];

  // Swipe state for mobile
  const touchStartX = useRef(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipeAction, setSwipeAction] = useState<'reply' | 'archive' | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setSwipeOffset(0);
    setSwipeAction(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientX - touchStartX.current;
    const clamped = Math.max(-100, Math.min(100, diff));
    setSwipeOffset(clamped);
    if (clamped < -60) setSwipeAction('reply');
    else if (clamped > 60) setSwipeAction('archive');
    else setSwipeAction(null);
  };

  const handleTouchEnd = () => {
    if (swipeAction === 'reply' && onReply) {
      onReply(review);
    }
    // archive action can be handled here in the future
    setSwipeOffset(0);
    setSwipeAction(null);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;
    router.push(`/reviews/${review.id}`);
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Swipe background indicators (mobile only) */}
      <div className="absolute inset-0 flex md:hidden">
        <div className={`flex-1 flex items-center justify-start pl-4 ${swipeAction === 'archive' ? 'bg-steel/20' : ''}`}>
          {swipeOffset > 40 && <Archive size={20} className="text-steel" />}
        </div>
        <div className={`flex-1 flex items-center justify-end pr-4 ${swipeAction === 'reply' ? 'bg-navy/20' : ''}`}>
          {swipeOffset < -40 && <Reply size={20} className="text-navy" />}
        </div>
      </div>

      <div
        onClick={handleCardClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateX(${swipeOffset}px)` }}
        className={`relative bg-surface rounded-xl shadow-sm border border-border overflow-hidden transition-all cursor-pointer hover:shadow-md ${
          isHighPriority ? 'ring-1 ring-danger/40 border-danger/40' : ''
        } ${highlight ? 'ring-2 ring-accent-blue shadow-md' : ''}`}
      >
        <div className="flex flex-col md:flex-row">
          {/* Left column - Author info */}
          <div className="md:w-[200px] shrink-0 p-4 md:p-6 md:pr-4 flex flex-row md:flex-col items-center md:border-r border-b md:border-b-0 border-border/50 gap-3 md:gap-0">
            {review.authorAvatar ? (
              <Image
                src={review.authorAvatar}
                alt={review.authorName}
                width={56}
                height={56}
                className="rounded-full object-cover w-10 h-10 md:w-14 md:h-14 md:mb-2"
                unoptimized
              />
            ) : (
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-steel text-white flex items-center justify-center font-bold md:mb-2 text-sm md:text-base">
                {review.authorInitials}
              </div>
            )}
            <div className="flex-1 md:text-center">
              <span className="text-sm font-semibold text-text-primary">
                {review.authorName}
              </span>
              <p className="text-[11px] text-text-secondary mt-0.5">
                {review.localGuide
                  ? `Local Guide • ${review.reviewCount} reviews`
                  : review.reviewCount
                    ? review.reviewCount > 5
                      ? 'Top Reviewer'
                      : 'New Reviewer'
                    : 'New Reviewer'}
              </p>
            </div>

            {/* Mobile: inline platform + date */}
            <div className="flex md:hidden items-center gap-2">
              <div
                className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold"
                style={{ backgroundColor: pIcon.color }}
              >
                {pIcon.letter}
              </div>
              <span className="text-[10px] text-text-secondary">{review.postedAt}</span>
            </div>

            {/* Desktop: Platform */}
            <div className="hidden md:flex mt-5 items-center gap-2 w-full">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: pIcon.color }}
              >
                {pIcon.letter}
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                  Platform
                </p>
                <p className="text-xs font-medium text-text-primary">
                  {platformLabel(review.platform)}
                </p>
              </div>
            </div>

            {/* Desktop: Posted */}
            <div className="hidden md:flex mt-3 items-center gap-2 w-full">
              <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-text-secondary shrink-0">
                <Calendar size={14} />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                  Posted
                </p>
                <p className="text-xs font-medium text-text-primary">{review.postedAt}</p>
              </div>
            </div>
          </div>

          {/* Right column - Review content */}
          <div className="flex-1 p-4 md:p-6 flex flex-col">
            {/* Rating + Status row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base text-warning">{renderStars(review.rating)}</span>
                <span className="text-sm font-semibold text-navy">{review.rating}.0</span>
                <span className="text-sm text-text-secondary hidden sm:inline">{ratingLabel(review.rating)}</span>
              </div>
              <StatusBadge status={review.status} />
            </div>

            {/* Title */}
            {review.title && (
              <h3 className="text-[17px] font-bold text-text-primary mb-2">
                &ldquo;{review.title}&rdquo;
              </h3>
            )}

            {/* Content */}
            <p className="text-sm text-text-secondary leading-relaxed flex-1">
              {review.content}
            </p>

            {/* Reply area (for replied reviews) */}
            {review.reply && (
              <div className="mt-4 bg-background rounded-lg p-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center text-[10px] font-bold">
                    JM
                  </div>
                  <span className="text-sm font-semibold text-text-primary">Your Reply</span>
                  <span className="text-xs text-text-secondary">
                    Replied {review.reply.repliedAt}
                  </span>
                </div>
                <p className="text-sm text-text-secondary italic ml-[38px]">
                  &ldquo;{review.reply.content}&rdquo;
                </p>
              </div>
            )}

            {/* Bottom row - Tags + Action */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 flex-wrap">
                {review.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                      tag === 'OPERATIONS'
                        ? 'text-warning border-warning/30 bg-warning/10'
                        : 'text-text-secondary border-border bg-surface'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {review.status === 'replied' ? (
                <a
                  href="#"
                  className="text-xs font-medium text-accent-blue hover:underline hidden md:inline"
                >
                  View full thread →
                </a>
              ) : review.platform === 'yelp' ? (
                <a
                  href={`https://www.yelp.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-[#D32323] text-white hover:bg-[#b81e1e] transition-colors"
                >
                  <ExternalLink size={14} />
                  Open in Yelp
                </a>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => onReply?.(review)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      isHighPriority
                        ? 'bg-danger text-white hover:bg-red-700'
                        : 'bg-navy text-white hover:bg-navy-dark'
                    }`}
                  >
                    <Reply size={14} />
                    Reply to {review.authorName.split(' ')[0]}
                  </button>
                  {isHighPriority && (
                    <button
                      onClick={() => onReply?.(review)}
                      className="w-9 h-9 rounded-lg bg-navy text-white flex items-center justify-center hover:bg-navy-dark transition-colors"
                    >
                      <Send size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
