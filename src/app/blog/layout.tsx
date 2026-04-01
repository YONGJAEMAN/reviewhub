import Link from 'next/link';
import Footer from '@/components/landing/Footer';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-surface">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-navy">
            ReviewHub
          </Link>
          <Link
            href="/blog"
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Blog
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">{children}</main>
      <Footer />
    </div>
  );
}
