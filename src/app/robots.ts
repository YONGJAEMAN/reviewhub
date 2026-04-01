import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://reviewhub.app';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/reviews', '/settings', '/admin', '/api', '/onboarding', '/analytics'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
