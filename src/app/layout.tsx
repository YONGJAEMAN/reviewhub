import type { Metadata } from 'next';
import './globals.css';
import ThemeProvider from '@/components/ThemeProvider';
import SessionProvider from '@/components/SessionProvider';

export const metadata: Metadata = {
  title: {
    default: 'ReviewHub - Small Business Review Management',
    template: '%s | ReviewHub',
  },
  description:
    'Manage all your business reviews from Google, Yelp, Facebook, and WhatsApp in one dashboard.',
  keywords: ['review management', 'small business', 'reputation management', 'google reviews', 'yelp reviews'],
  openGraph: {
    title: 'ReviewHub',
    description: 'All your reviews. One dashboard.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full">
        <SessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
