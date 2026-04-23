'use client';

import { useState } from 'react';
import { MessageSquarePlus, X, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function FeedbackButton() {
  const t = useTranslations('feedback');
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('general');
  const [content, setContent] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { value: 'bug', label: t('categories.bug') },
    { value: 'feature', label: t('categories.feature') },
    { value: 'general', label: t('categories.general') },
    { value: 'ux', label: t('categories.ux') },
  ];

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, content: content.trim(), email: email || undefined }),
      });
      setSubmitted(true);
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setContent('');
        setCategory('general');
        setEmail('');
      }, 2000);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_FEATURE_FEEDBACK === 'false') {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-navy text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-navy-dark transition-colors"
        title={t('buttonTitle')}
      >
        {open ? <X size={20} /> : <MessageSquarePlus size={20} />}
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 bg-surface rounded-xl shadow-xl border border-border overflow-hidden">
          {submitted ? (
            <div className="p-6 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm font-medium text-text-primary">{t('successTitle')}</p>
              <p className="text-xs text-text-secondary">{t('successMessage')}</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-text-primary">{t('title')}</h3>
              </div>
              <div className="p-4 space-y-3">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value.slice(0, 500))}
                  placeholder={t('placeholder')}
                  rows={3}
                  className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
                />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-text-secondary">{content.length}/500</span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!content.trim() || loading}
                  className="w-full flex items-center justify-center gap-2 bg-navy text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-navy-dark transition-colors disabled:opacity-40"
                >
                  <Send size={14} />
                  {loading ? t('sending') : t('submit')}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
