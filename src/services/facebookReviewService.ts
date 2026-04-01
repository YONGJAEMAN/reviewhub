import { prisma } from '@/lib/prisma';
import { fetchFacebookRatings, replyToFacebookReview, type FBRating } from '@/lib/facebook';
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

function fbRatingToStars(rating: FBRating): number {
  // Facebook has two systems: star rating (1-5) and recommendation (positive/negative)
  if (rating.rating) return rating.rating;
  if (rating.recommendation_type === 'positive') return 5;
  if (rating.recommendation_type === 'negative') return 1;
  return 3;
}

function determineTags(text: string | undefined, rating: number): string[] {
  if (!text) return [rating >= 4 ? 'POSITIVE' : rating <= 2 ? 'NEGATIVE' : 'NEUTRAL'];
  const tags: string[] = [];
  const lower = text.toLowerCase();
  if (lower.includes('service') || lower.includes('staff')) tags.push('CUSTOMER SERVICE');
  if (lower.includes('quality') || lower.includes('product')) tags.push('QUALITY');
  if (lower.includes('price')) tags.push('PRICING');
  if (tags.length === 0) tags.push(rating >= 4 ? 'POSITIVE' : rating <= 2 ? 'NEGATIVE' : 'NEUTRAL');
  return tags.slice(0, 3);
}

/**
 * Sync Facebook reviews for a specific platform connection.
 */
export async function syncFacebookReviews(platformId: string): Promise<{
  synced: number;
  errors: string[];
}> {
  const platform = await prisma.platform.findUnique({
    where: { id: platformId },
    include: { business: true },
  });

  if (!platform || platform.type !== 'FACEBOOK' || platform.status !== 'CONNECTED') {
    return { synced: 0, errors: ['Platform not found or not connected'] };
  }

  if (!platform.accessToken || !platform.externalId) {
    return { synced: 0, errors: ['Facebook page token or page ID not configured'] };
  }

  let fbRatings: FBRating[];
  try {
    fbRatings = await fetchFacebookRatings(platform.accessToken, platform.externalId);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    if (msg === 'RATE_LIMITED') {
      return { synced: 0, errors: ['Facebook API rate limit exceeded'] };
    }
    return { synced: 0, errors: [msg] };
  }

  let synced = 0;
  const errors: string[] = [];

  for (const fbr of fbRatings) {
    try {
      const externalId = `fb-${fbr.reviewer.id}-${fbr.created_time}`;
      const rating = fbRatingToStars(fbr);
      const content = fbr.review_text || (fbr.recommendation_type === 'positive' ? 'Recommended' : 'Not recommended');

      const upserted = await prisma.review.upsert({
        where: { externalId },
        update: {
          content,
          rating,
        },
        create: {
          externalId,
          platform: 'FACEBOOK',
          authorName: fbr.reviewer.name,
          authorInitials: getInitials(fbr.reviewer.name),
          rating,
          content,
          tags: determineTags(fbr.review_text, rating),
          status: rating <= 2 ? 'HIGH_PRIORITY' : 'ACTION_REQUIRED',
          postedAt: new Date(fbr.created_time),
          businessId: platform.businessId,
          platformId: platform.id,
        },
      });

      const isNew = upserted.sentimentScore === null;
      if (isNew && upserted.content) {
        try {
          const sentiment = await analyzeSentiment(upserted.content, rating);
          await prisma.review.update({
            where: { id: upserted.id },
            data: {
              sentimentScore: sentiment.score,
              sentimentLabel: sentiment.label,
              sentimentKeywords: sentiment.keywords,
              urgency: sentiment.urgency,
              tags: sentiment.keywords.slice(0, 3),
              status: determineStatusFromSentiment(rating, sentiment.urgency, false),
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
            reviewerName: fbr.reviewer.name,
            rating,
            content,
            reviewId: upserted.id,
          });
        } catch { /* notification failure is non-critical */ }
      }

      synced++;
    } catch (err) {
      errors.push(`Failed to sync FB review: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  }

  await prisma.platform.update({
    where: { id: platformId },
    data: {
      lastSynced: new Date(),
      detail: `Last synced just now · ${synced} reviews`,
    },
  });

  return { synced, errors };
}

/**
 * Reply to a Facebook review via the API.
 */
export async function replyToFBReview(
  reviewId: string
, content: string
): Promise<{ success: boolean; error?: string }> {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { platformRef: true },
  });

  if (!review || review.platform !== 'FACEBOOK' || !review.externalId) {
    return { success: false, error: 'Not a Facebook review' };
  }

  const platform = review.platformRef;
  if (!platform?.accessToken) {
    return { success: false, error: 'No Facebook page token' };
  }

  // The externalId contains the story ID needed for commenting
  // For Facebook, we need the open_graph_story id
  try {
    await replyToFacebookReview(platform.accessToken, review.externalId, content);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }

  await prisma.reply.upsert({
    where: { reviewId: review.id },
    update: { content },
    create: { content, reviewId: review.id },
  });

  await prisma.review.update({
    where: { id: review.id },
    data: { status: 'REPLIED' },
  });

  return { success: true };
}

/**
 * Sync all connected Facebook platforms.
 */
export async function syncAllFacebookPlatforms(): Promise<{
  total: number;
  synced: number;
  errors: string[];
}> {
  const platforms = await prisma.platform.findMany({
    where: { type: 'FACEBOOK', status: 'CONNECTED' },
  });

  let totalSynced = 0;
  const allErrors: string[] = [];

  for (const platform of platforms) {
    if (!platform.accessToken || !platform.externalId) continue;
    const result = await syncFacebookReviews(platform.id);
    totalSynced += result.synced;
    allErrors.push(...result.errors);
  }

  return { total: platforms.length, synced: totalSynced, errors: allErrors };
}
