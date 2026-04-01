'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { useLocale } from 'next-intl';

const localeLabels: Record<string, string> = {
  ko: 'KO',
  en: 'EN',
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = async (newLocale: string) => {
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: newLocale }),
    });
    setOpen(false);
    router.refresh();
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-colors text-sm"
      >
        <Globe size={16} />
        {localeLabels[locale]}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50 min-w-[100px]">
          {Object.entries(localeLabels).map(([code, label]) => (
            <button
              key={code}
              onClick={() => handleChange(code)}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-background transition-colors ${
                locale === code ? 'font-semibold text-navy' : 'text-text-secondary'
              }`}
            >
              {label === 'KO' ? '한국어' : 'English'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
