'use client';

import { useRouter } from 'next/navigation';
import type { Review } from '@/types';
import { renderStars, ratingLabel, platformLabel } from '@/lib/utils';
import { Calendar, Reply, CheckCircle, Send } from 'lucide-react';

const platformIcons: Record<string, { letter: string; bg: string }> = {
  google: { letter: 'G', bg: '#4285F4' },
  yelp: { letter: 'Y', bg: '#D32323' },
  facebook: { letter: 'f', bg: '#1877F2' },
  whatsapp: { letter: 'W', bg: '#25D366' },
};

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
  const pIcon = platformIcons[review.platform];

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;
    router.push(`/reviews/${review.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-surface rounded-xl shadow-sm border border-border overflow-hidden transition-all cursor-pointer hover:shadow-md ${
        isHighPriority ? 'ring-1 ring-danger/40 border-danger/40' : ''
      } ${highlight ? 'ring-2 ring-accent-blue shadow-md' : ''}`}
    >
      <div className="flex">
        {/* Left column - Author info */}
        <div className="w-[200px] shrink-0 p-6 pr-4 flex flex-col items-center border-r border-border/50">
          {review.authorAvatar ? (
            <img
              src={review.authorAvatar}
              alt={review.authorName}
              className="w-14 h-14 rounded-full object-cover mb-2"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-steel text-white flex items-center justify-center font-bold mb-2">
              {review.authorInitials}
            </div>
          )}
          <span className="text-sm font-semibold text-text-primary text-center">
            {review.authorName}
          </span>
          <p className="text-[11px] text-text-secondary text-center mt-0.5">
            {review.localGuide
              ? `Local Guide • ${review.reviewCount} reviews`
              : review.reviewCount
                ? review.reviewCount > 5
                  ? 'Top Reviewer'
                  : 'New Reviewer'
                : 'New Reviewer'}
          </p>

          {/* Platform */}
          <div className="mt-5 flex items-center gap-2 w-full">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: pIcon.bg }}
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

          {/* Posted */}
          <div className="mt-3 flex items-center gap-2 w-full">
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
        <div className="flex-1 p-6 flex flex-col">
          {/* Rating + Status row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base text-warning">{renderStars(review.rating)}</span>
              <span className="text-sm font-semibold text-navy">{review.rating}.0</span>
              <span className="text-sm text-text-secondary">{ratingLabel(review.rating)}</span>
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
            <div className="flex items-center gap-2">
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
                className="text-xs font-medium text-accent-blue hover:underline"
              >
                View full thread →
              </a>
            ) : (
              <div className="flex items-center gap-2">
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
  );
}
