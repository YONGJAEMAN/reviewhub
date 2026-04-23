import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Review management tips and insights for small businesses',
  openGraph: {
    title: 'ReviewHub Blog',
    description: 'Review management tips and insights for small businesses',
    images: [{ url: '/api/og?title=ReviewHub%20Blog&description=Review%20management%20tips%20and%20insights', width: 1200, height: 630 }],
  },
};

export default async function BlogPage() {
  const t = await getTranslations('blog');
  const posts = getAllPosts();

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-text-primary mb-2">{t('title')}</h1>
        <p className="text-text-secondary">
          {t('subtitle')}
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-text-secondary">{t('noPosts')}</p>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-surface rounded-xl border border-border p-6 hover:border-accent-blue transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-text-secondary">
                  {new Date(post.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span className="text-xs text-text-secondary">·</span>
                <span className="text-xs text-text-secondary">{post.author}</span>
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                {post.title}
              </h2>
              <p className="text-sm text-text-secondary line-clamp-2">
                {post.description}
              </p>
              {post.tags.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] bg-accent-blue/10 text-accent-blue px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
