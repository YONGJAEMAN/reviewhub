'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Send, Star } from 'lucide-react';
import { reviews, reviewerHistories } from '@/data/mockData';
import { renderStars, ratingLabel, platformLabel } from '@/lib/utils';

const platformIcons: Record<string, { letter: string; bg: string }> = {
  google: { letter: 'G', bg: '#4285F4' },
  yelp: { letter: 'Y', bg: '#D32323' },
  facebook: { letter: 'f', bg: '#1877F2' },
  whatsapp: { letter: 'W', bg: '#25D366' },
};

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const review = reviews.find((r) => r.id === id);
  const history = reviewerHistories[id] ?? [];

  const [replyText, setReplyText] = useState('');
  const [localReply, setLocalReply] = useState(review?.reply ?? null);

  if (!review) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary mb-4">Review not found.</p>
        <Link href="/reviews" className="text-accent-blue hover:underline text-sm">
          ← Back to Review Feed
        </Link>
      </div>
    );
  }

  const pIcon = platformIcons[review.platform];

  const handleSend = () => {
    if (!replyText.trim()) return;
    setLocalReply({ content: replyText.trim(), repliedAt: 'Just now' });
    setReplyText('');
  };

  return (
    <div>
      <button
        onClick={() => router.push('/reviews')}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-navy mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Review Feed
      </button>

      <div className="flex gap-6">
        {/* Left 70% - Review content */}
        <div className="flex-1 min-w-0">
          <div className="bg-surface rounded-xl shadow-sm border border-border p-8">
            {/* Profile header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
              {review.authorAvatar ? (
                <img
                  src={review.authorAvatar}
                  alt={review.authorName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-steel text-white flex items-center justify-center font-bold text-lg">
                  {review.authorInitials}
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-text-primary">{review.authorName}</h2>
                <p className="text-sm text-text-secondary">
                  {review.localGuide
                    ? `Local Guide · ${review.reviewCount} reviews`
                    : review.reviewCount
                      ? `${review.reviewCount} reviews`
                      : 'New Reviewer'}
                </p>
                {review.isVerified && (
                  <span className="inline-block mt-1 text-[10px] font-semibold text-success bg-badge-green rounded-full px-2 py-0.5 uppercase">
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg text-warning">{renderStars(review.rating)}</span>
              <span className="text-lg font-bold text-navy">{review.rating}.0</span>
              <span className="text-sm text-text-secondary">{ratingLabel(review.rating)}</span>
            </div>

            {/* Title + Content */}
            {review.title && (
              <h3 className="text-xl font-bold text-text-primary mb-3">
                &ldquo;{review.title}&rdquo;
              </h3>
            )}
            <p className="text-sm text-text-secondary leading-relaxed mb-6">{review.content}</p>

            {/* Platform + Date */}
            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-border">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: pIcon.bg }}
                >
                  {pIcon.letter}
                </div>
                <span className="text-sm text-text-primary">{platformLabel(review.platform)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Calendar size={14} />
                {review.postedAt}
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 mb-6">
              {review.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Reply history */}
            {localReply && (
              <div className="bg-background rounded-lg p-5 mb-6">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-[10px] font-bold">
                    JM
                  </div>
                  <span className="text-sm font-semibold text-text-primary">Your Reply</span>
                  <span className="text-xs text-text-secondary">
                    Replied {localReply.repliedAt}
                  </span>
                </div>
                <p className="text-sm text-text-secondary italic ml-[42px]">
                  &ldquo;{localReply.content}&rdquo;
                </p>
              </div>
            )}

            {/* New reply textarea */}
            {!localReply && (
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-3">Write a Reply</h3>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your response..."
                  rows={4}
                  className="w-full bg-surface text-text-primary border border-border rounded-lg px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none mb-3"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSend}
                    disabled={!replyText.trim()}
                    className="flex items-center gap-2 bg-navy text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-navy-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send size={14} />
                    Send Reply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 30% - Reviewer history sidebar */}
        <div className="w-[300px] shrink-0">
          <div className="bg-surface rounded-xl shadow-sm border border-border p-6 sticky top-20">
            <h3 className="text-base font-semibold text-text-primary mb-4">
              Previous Reviews by {review.authorName.split(' ')[0]}
            </h3>
            {history.length > 0 ? (
              <div className="space-y-4">
                {history.map((h) => (
                  <div key={h.id} className="pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-warning">{renderStars(h.rating)}</span>
                      <span className="text-xs text-text-secondary">{h.date}</span>
                    </div>
                    <p className="text-sm text-text-primary font-medium truncate">{h.title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-secondary">No previous reviews found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
