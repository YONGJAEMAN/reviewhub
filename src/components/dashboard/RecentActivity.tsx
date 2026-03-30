import Link from 'next/link';
import { reviews } from '@/data/mockData';
import { renderStars } from '@/lib/utils';

const platformIcons: Record<string, { letter: string; bg: string }> = {
  google: { letter: 'G', bg: '#4285F4' },
  yelp: { letter: 'Y', bg: '#D32323' },
  facebook: { letter: 'f', bg: '#1877F2' },
  whatsapp: { letter: 'W', bg: '#25D366' },
};

export default function RecentActivity() {
  const recent = reviews.slice(0, 3);

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Recent Activity</h2>
        <Link href="/reviews" className="text-sm font-medium text-accent-blue hover:underline">
          View All Feed
        </Link>
      </div>
      <div className="divide-y divide-border">
        {recent.map((review) => {
          const pIcon = platformIcons[review.platform];
          return (
            <div key={review.id} className="py-5 first:pt-0 last:pb-0">
              <div className="flex items-start gap-4">
                {review.authorAvatar ? (
                  <img
                    src={review.authorAvatar}
                    alt={review.authorName}
                    className="w-11 h-11 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-steel text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {review.authorInitials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">
                        {review.authorName}
                      </span>
                      {review.isVerified && (
                        <span className="text-[10px] font-semibold text-success bg-badge-green rounded-full px-2 py-0.5 uppercase">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-secondary shrink-0">
                      <span>{review.postedAt} on</span>
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold"
                        style={{ backgroundColor: pIcon.bg }}
                      >
                        {pIcon.letter}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-warning mb-2">{renderStars(review.rating)}</div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    &ldquo;{review.content}&rdquo;
                  </p>
                </div>
                <Link
                  href="/reviews"
                  className="shrink-0 mt-6 text-xs font-medium text-navy border border-border rounded-lg px-4 py-2 hover:bg-background transition-colors"
                >
                  Reply
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
