import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: '블로그',
  description: '소규모 비즈니스를 위한 리뷰 관리 팁과 인사이트',
  openGraph: {
    title: 'ReviewHub 블로그',
    description: '소규모 비즈니스를 위한 리뷰 관리 팁과 인사이트',
    images: [{ url: '/api/og?title=ReviewHub%20Blog&description=리뷰%20관리%20팁과%20인사이트', width: 1200, height: 630 }],
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Blog</h1>
        <p className="text-text-secondary">
          소규모 비즈니스를 위한 리뷰 관리 팁과 인사이트
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-text-secondary">아직 게시된 글이 없습니다.</p>
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
                  {new Date(post.date).toLocaleDateString('ko-KR', {
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
