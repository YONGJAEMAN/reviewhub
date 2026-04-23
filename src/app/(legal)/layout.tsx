import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import Footer from '@/components/landing/Footer';

export default async function LegalLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('common');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-surface">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-navy">
            {t('reviewHub')}
          </Link>
          <Link href="/" className="text-sm text-text-secondary hover:text-navy transition-colors">
            {t('home')}
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
