import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import CookieBanner from '@/components/CookieBanner';
import JsonLd from '@/components/JsonLd';
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
    images: [{ url: '/api/og?title=ReviewHub&description=All%20your%20reviews.%20One%20dashboard.', width: 1200, height: 630 }],
  },
  alternates: {
    languages: {
      ko: '/',
      en: '/',
    },
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://reviewhub.app'),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#0F1B2D" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="h-full">
        <JsonLd type="organization" />
        <NextIntlClientProvider messages={messages}>
          <SessionProvider>
            <ThemeProvider>{children}</ThemeProvider>
            <Analytics />
            <CookieBanner />
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
