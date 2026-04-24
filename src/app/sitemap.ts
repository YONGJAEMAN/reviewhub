import type { MetadataRoute } from 'next';
import { getAllSlugs } from '@/lib/blog';
import { locales } from '@/i18n/config';

/**
 * Sitemap with hreflang alternates for every supported locale.
 *
 * The app uses locale prefixing via next-intl routing, but public marketing
 * pages (landing, pricing, blog) are served without a locale prefix today.
 * We still advertise the canonical URL once and list each locale as an
 * `alternate` so search engines can show the right variant.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://reviewhub.app';

  const alternatesFor = (path: string) => ({
    languages: Object.fromEntries(
      locales.map((l) => [l, `${baseUrl}${path}`]),
    ),
  });

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1, alternates: alternatesFor('/') },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8, alternates: alternatesFor('/pricing') },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7, alternates: alternatesFor('/blog') },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3, alternates: alternatesFor('/privacy') },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3, alternates: alternatesFor('/terms') },
  ];

  const blogPages: MetadataRoute.Sitemap = getAllSlugs().map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
    alternates: alternatesFor(`/blog/${slug}`),
  }));

  return [...staticPages, ...blogPages];
}
