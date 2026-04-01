'use client';

import { useState, useEffect } from 'react';
import { Gift, Copy, Check, Users, UserPlus, Award } from 'lucide-react';

interface ReferralData {
  code: string;
  link: string;
  total: number;
  pending: number;
  completed: number;
  rewarded: number;
}

export default function ReferralSection() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/referrals')
      .then((res) => res.json())
      .then((json) => setData(json.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(data.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    if (!data) return;
    const text = `ReviewHub로 리뷰를 쉽게 관리하세요! ${data.link}`;
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.link)}`,
      email: `mailto:?subject=${encodeURIComponent('ReviewHub 추천')}&body=${encodeURIComponent(text)}`,
    };
    window.open(urls[platform], '_blank');
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-xl shadow-sm border border-border p-6 animate-pulse h-48" />
    );
  }

  if (!data) return null;

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Gift size={20} className="text-accent-blue" />
        <h2 className="text-lg font-semibold text-text-primary">Refer & Earn</h2>
      </div>
      <p className="text-sm text-text-secondary mb-4">
        친구를 초대하면 양쪽 모두에게 혜택이 제공됩니다.
      </p>

      {/* Referral Link */}
      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          value={data.link}
          readOnly
          className="flex-1 px-3 py-2 bg-background text-text-primary border border-border rounded-lg text-sm"
        />
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-4 py-2 bg-navy text-white text-sm font-medium rounded-lg hover:bg-navy-dark transition-colors"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? '복사됨' : '복사'}
        </button>
      </div>

      {/* Share Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleShare('twitter')}
          className="flex-1 text-center py-2 text-xs font-medium text-text-secondary border border-border rounded-lg hover:bg-background transition-colors"
        >
          Twitter
        </button>
        <button
          onClick={() => handleShare('linkedin')}
          className="flex-1 text-center py-2 text-xs font-medium text-text-secondary border border-border rounded-lg hover:bg-background transition-colors"
        >
          LinkedIn
        </button>
        <button
          onClick={() => handleShare('email')}
          className="flex-1 text-center py-2 text-xs font-medium text-text-secondary border border-border rounded-lg hover:bg-background transition-colors"
        >
          Email
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-background rounded-lg">
          <UserPlus size={16} className="mx-auto mb-1 text-text-secondary" />
          <div className="text-lg font-bold text-text-primary">{data.total}</div>
          <div className="text-[11px] text-text-secondary">초대</div>
        </div>
        <div className="text-center p-3 bg-background rounded-lg">
          <Users size={16} className="mx-auto mb-1 text-text-secondary" />
          <div className="text-lg font-bold text-text-primary">{data.completed}</div>
          <div className="text-[11px] text-text-secondary">가입 완료</div>
        </div>
        <div className="text-center p-3 bg-background rounded-lg">
          <Award size={16} className="mx-auto mb-1 text-text-secondary" />
          <div className="text-lg font-bold text-text-primary">{data.rewarded}</div>
          <div className="text-[11px] text-text-secondary">보상 지급</div>
        </div>
      </div>
    </div>
  );
}
