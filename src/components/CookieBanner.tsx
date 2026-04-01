'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border shadow-lg">
      <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-text-secondary flex-1">
          이 사이트는 서비스 제공 및 분석을 위해 쿠키를 사용합니다.{' '}
          <Link href="/cookie" className="text-accent-blue hover:underline">
            자세히 보기
          </Link>
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={decline}
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-4 py-2"
          >
            거부
          </button>
          <button
            onClick={accept}
            className="bg-navy text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-navy-dark transition-colors"
          >
            동의합니다
          </button>
        </div>
      </div>
    </div>
  );
}
