import { prisma } from '@/lib/prisma';
import { fetchYelpReviews, type YelpReview } from '@/lib/yelp';
import { analyzeSentiment, determineStatusFromSentiment } from '@/services/sentimentService';
import { notifyNewReview } from '@/services/notificationService';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function determineTags(text: string, rating: number): string[] {
  const tags: string[] = [];
  const lower = text.toLowerCase();

  if (lower.includes('service') || lower.includes('staff')) tags.push('CUSTOMER SERVICE');
  if (lower.includes('food') || lower.includes('quality')) tags.push('QUALITY');
  if (lower.includes('price') || lower.includes('expensive')) tags.push('PRICING');
  if (lower.includes('wait') || lower.includes('slow')) tags.push('OPERATIONS');

  if (tags.length === 0) {
    tags.push(rating >= 4 ? 'POSITIVE' : rating <= 2 ? 'NEGATIVE' : 'NEUTRAL');
  }
  return tags.slice(0, 3);
}

/**
 * Sync Yelp reviews for a specific platform connection.
 * Note: Yelp free tier only returns 3 most recent reviews.
 */
export async function syncYelpReviews(platformId: string): Promise<{
  synced: number;
  errors: string[];
}> {
  const platform = await prisma.platform.findUnique({
    where: { id: platformId },
    include: { business: true },
  });

  if (!platform || platform.type !== 'YELP' || platform.status !== 'CONNECTED') {
    return { synced: 0, errors: ['Platform not found or not connected'] };
  }

  if (!platform.externalId) {
    return { synced: 0, errors: ['Yelp business ID not configured'] };
  }

  let yelpReviews: YelpReview[];
  try {
    yelpReviews = await fetchYelpReviews(platform.externalId);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return { synced: 0, errors: [msg] };
  }

  let synced = 0;
  const errors: string[] = [];

  for (const yr of yelpReviews) {
    try {
      const externalId = `yelp-${yr.id}`;

      const upserted = await prisma.review.upsert({
        where: { externalId },
        update: {
          content: yr.text,
          rating: yr.rating,
          authorAvatar: yr.user.image_url,
        },
        create: {
          externalId,
          platform: 'YELP',
          authorName: yr.user.name,
          authorAvatar: yr.user.image_url,
          authorInitials: getInitials(yr.user.name),
          rating: yr.rating,
          content: yr.text,
          tags: determineTags(yr.text, yr.rating),
          status: yr.rating <= 2 ? 'HIGH_PRIORITY' : 'ACTION_REQUIRED',
          postedAt: new Date(yr.time_created),
          businessId: platform.businessId,
          platformId: platform.id,
        },
      });

      const isNew = upserted.sentimentScore === null;
      if (isNew && upserted.content) {
        try {
          const sentiment = await analyzeSentiment(upserted.content, yr.rating);
          await prisma.review.update({
            where: { id: upserted.id },
            data: {
              sentimentScore: sentiment.score,
              sentimentLabel: sentiment.label,
              sentimentKeywords: sentiment.keywords,
              urgency: sentiment.urgency,
              tags: sentiment.keywords.slice(0, 3),
              status: determineStatusFromSentiment(yr.rating, sentiment.urgency, false),
            },
          });
        } catch { /* keep existing on failure */ }
      }

      // Notify on new reviews
      if (isNew) {
        try {
          await notifyNewReview({
            businessId: platform.businessId,
            businessName: platform.business.name,
            reviewerName: yr.user.name,
            rating: yr.rating,
            content: yr.text,
            reviewId: upserted.id,
          });
        } catch { /* notification failure is non-critical */ }
      }

      synced++;
    } catch (err) {
      errors.push(`Failed to sync Yelp review ${yr.id}: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  }

  await prisma.platform.update({
    where: { id: platformId },
    data: {
      lastSynced: new Date(),
      detail: `Last synced just now · ${synced} reviews (free tier: 3 max)`,
    },
  });

  return { synced, errors };
}
