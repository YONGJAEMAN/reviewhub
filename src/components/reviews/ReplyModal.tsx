'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Send } from 'lucide-react';
import type { Review } from '@/types';
import { renderStars } from '@/lib/utils';

interface Props {
  review: Review;
  onClose: () => void;
  onSend: (reviewId: string, replyContent: string) => void;
}

function getAiSuggestion(rating: number): string {
  if (rating >= 5) {
    return "Thank you so much for your wonderful review! We're thrilled to hear that you had such a positive experience with us. Your kind words mean the world to our team, and we can't wait to welcome you back. Please don't hesitate to reach out if there's anything we can do to make your next visit even better!";
  }
  if (rating <= 2) {
    return "We sincerely apologize for your experience. We take your feedback very seriously and want to make this right. Our management team has been notified and we'd love the opportunity to discuss this further. Please contact us directly at hello@artisancollective.com so we can address your concerns personally.";
  }
  return "Thank you for your feedback! We appreciate your honest review and are glad you enjoyed parts of your experience. We're always looking for ways to improve, and your suggestions are incredibly valuable. We'd love to have you back and show you the improvements we're making!";
}

export default function ReplyModal({ review, onClose, onSend }: Props) {
  const [reply, setReply] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleAiSuggest = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setReply(getAiSuggestion(review.rating));
      setIsGenerating(false);
    }, 600);
  };

  const handleSend = () => {
    if (!reply.trim()) return;
    onSend(review.id, reply.trim());
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
    >
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-[600px] flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">
            Reply to {review.authorName}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:bg-background hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Review Summary */}
        <div className="px-6 py-4 bg-background/50">
          <div className="flex items-center gap-3">
            {review.authorAvatar ? (
              <img
                src={review.authorAvatar}
                alt={review.authorName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-steel text-white flex items-center justify-center font-bold text-sm">
                {review.authorInitials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-primary">
                  {review.authorName}
                </span>
                <span className="text-sm text-warning">{renderStars(review.rating)}</span>
              </div>
              {review.title && (
                <p className="text-sm text-text-secondary truncate">{review.title}</p>
              )}
            </div>
          </div>
        </div>

        {/* Textarea */}
        <div className="p-6 pb-4">
          <textarea
            ref={textareaRef}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write your response..."
            rows={5}
            className="w-full bg-surface text-text-primary border border-border rounded-lg px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 pb-6">
          <button
            onClick={handleAiSuggest}
            disabled={isGenerating}
            className="flex items-center gap-2 border border-accent-blue text-accent-blue rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-accent-blue/5 transition-colors disabled:opacity-50"
          >
            <Sparkles size={16} className={isGenerating ? 'animate-spin' : ''} />
            {isGenerating ? 'Generating...' : 'AI Suggest Reply'}
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-3 py-2.5"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!reply.trim()}
              className="flex items-center gap-2 bg-navy text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-navy-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={14} />
              Send Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
