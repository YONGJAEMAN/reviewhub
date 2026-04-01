'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, Sparkles, Send, RefreshCw, Minus, Plus } from 'lucide-react';
import type { Review } from '@/types';
import { renderStars } from '@/lib/utils';

interface Props {
  review: Review;
  onClose: () => void;
  onSend: (reviewId: string, replyContent: string) => void;
}

type Tone = 'professional' | 'friendly' | 'apologetic';

const toneLabels: Record<Tone, string> = {
  professional: 'Professional',
  friendly: 'Friendly & Warm',
  apologetic: 'Apologetic & Sincere',
};

export default function ReplyModal({ review, onClose, onSend }: Props) {
  const [reply, setReply] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [tone, setTone] = useState<Tone>(review.rating <= 2 ? 'apologetic' : 'professional');
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiUsage, setAiUsage] = useState<{ used: number; limit: number } | null>(null);
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

  const callAI = async (lengthOption?: 'shorter' | 'longer') => {
    setIsGenerating(true);
    setAiError(null);

    try {
      const res = await fetch('/api/ai/suggest-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewContent: review.content,
          reviewRating: review.rating,
          reviewerName: review.authorName,
          businessName: 'Our Business',
          tone,
          length: lengthOption,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setAiError(json.error || 'Failed to generate reply');
        return;
      }

      setReply(json.data.reply);
      setAiGenerated(true);
      if (json.data.usage) setAiUsage(json.data.usage);
    } catch {
      setAiError('Network error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiSuggest = () => callAI();
  const handleRegenerate = () => callAI();
  const handleShorter = () => callAI('shorter');
  const handleLonger = () => callAI('longer');

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
              <Image
                src={review.authorAvatar}
                alt={review.authorName}
                width={40}
                height={40}
                className="rounded-full object-cover"
                unoptimized
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

        {/* Tone Selector */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">Tone:</span>
            <div className="flex gap-1.5">
              {(Object.keys(toneLabels) as Tone[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    tone === t
                      ? 'bg-accent-blue text-white'
                      : 'bg-background text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {toneLabels[t]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Textarea */}
        <div className="px-6 pb-2">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={reply}
              onChange={(e) => { setReply(e.target.value); setAiGenerated(false); }}
              placeholder="Write your response..."
              rows={5}
              disabled={isGenerating}
              className="w-full bg-surface text-text-primary border border-border rounded-lg px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none disabled:opacity-60"
            />
            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface/80 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-accent-blue">
                  <div className="w-4 h-4 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
                  Generating reply...
                </div>
              </div>
            )}
          </div>

          {/* AI adjustment buttons (shown after AI generation) */}
          {aiGenerated && !isGenerating && (
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
              >
                <RefreshCw size={12} />
                Regenerate
              </button>
              <button
                onClick={handleShorter}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
              >
                <Minus size={12} />
                Shorter
              </button>
              <button
                onClick={handleLonger}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
              >
                <Plus size={12} />
                Longer
              </button>
              {aiUsage && (
                <span className="ml-auto text-[11px] text-text-secondary">
                  {aiUsage.used}/{aiUsage.limit} AI replies this month
                </span>
              )}
            </div>
          )}

          {/* Error message */}
          {aiError && (
            <p className="mt-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {aiError}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 pb-6 pt-2">
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
              disabled={!reply.trim() || isGenerating}
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
