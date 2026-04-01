import { prisma } from '@/lib/prisma';
import {
  getGoogleAccessToken,
  fetchGoogleReviewsAPI,
  replyToGoogleReviewAPI,
} from '@/lib/google';
import { analyzeSentiment, determineStatusFromSentiment } from '@/services/sentimentService';
import { notifyNewReview } from '@/services/notificationService';

interface GoogleReview {
  reviewId: string;
  name: string; // e.g. accounts/{id}/locations/{id}/reviews/{id}
  reviewer: {
    displayName: string;
    profilePhotoUrl?: string;
  };
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

const starRatingMap: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function determineStatus(rating: number, hasReply: boolean): 'ACTION_REQUIRED' | 'HIGH_PRIORITY' | 'REPLIED' {
  if (hasReply) return 'REPLIED';
  if (rating <= 2) return 'HIGH_PRIORITY';
  return 'ACTION_REQUIRED';
}

function determineTags(comment: string | undefined, rating: number): string[] {
  if (!comment) return [];
  const tags: string[] = [];
  const lower = comment.toLowerCase();

  if (lower.includes('service') || lower.includes('staff')) tags.push('CUSTOMER SERVICE');
  if (lower.includes('quality') || lower.includes('product')) tags.push('QUALITY');
  if (lower.includes('price') || lower.includes('expensive') || lower.includes('cheap')) tags.push('PRICING');
  if (lower.includes('wait') || lower.includes('slow')) tags.push('OPERATIONS');
  if (lower.includes('delivery') || lower.includes('shipping')) tags.push('DELIVERY');

  if (tags.length === 0) {
    tags.push(rating >= 4 ? 'POSITIVE' : rating <= 2 ? 'NEGATIVE' : 'NEUTRAL');
  }

  return tags.slice(0, 3);
}

/**
 * Sync Google reviews for a specific platform connection.
 * Upserts reviews using externalId for deduplication.
 */
export async function syncGoogleReviews(platformId: string): Promise<{
  synced: number;
  errors: string[];
}> {
  const platform = await prisma.platform.findUnique({
    where: { id: platformId },
    include: { business: true },
  });

  if (!platform || platform.type !== 'GOOGLE' || platform.status !== 'CONNECTED') {
    return { synced: 0, errors: ['Platform not found or not connected'] };
  }

  const userId = platform.business.ownerId;
  const accessToken = await getGoogleAccessToken(userId);

  if (!accessToken) {
    return { synced: 0, errors: ['No valid Google access token'] };
  }

  const locationName = `accounts/${platform.accountId}/locations/${platform.locationId}`;
  let googleReviews: GoogleReview[];

  try {
    googleReviews = await fetchGoogleReviewsAPI(accessToken, locationName);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'RATE_LIMITED') {
      return { synced: 0, errors: ['Google API rate limit exceeded. Will retry later.'] };
    }
    return { synced: 0, errors: [message] };
  }

  let synced = 0;
  const errors: string[] = [];

  for (const gReview of googleReviews) {
    try {
      const rating = starRatingMap[gReview.starRating] ?? 3;
      const hasReply = !!gReview.reviewReply;

      const upserted = await prisma.review.upsert({
        where: { externalId: gReview.name },
        update: {
          content: gReview.comment ?? '(No comment)',
          rating,
          authorAvatar: gReview.reviewer.profilePhotoUrl ?? null,
          status: determineStatus(rating, hasReply),
          updatedAt: new Date(),
        },
        create: {
          externalId: gReview.name,
          platform: 'GOOGLE',
          authorName: gReview.reviewer.displayName,
          authorAvatar: gReview.reviewer.profilePhotoUrl ?? null,
          authorInitials: getInitials(gReview.reviewer.displayName),
          rating,
          content: gReview.comment ?? '(No comment)',
          tags: determineTags(gReview.comment, rating),
          status: determineStatus(rating, hasReply),
          postedAt: new Date(gReview.createTime),
          businessId: platform.businessId,
          platformId: platform.id,
        },
      });

      // Run sentiment analysis on new reviews
      const isNew = upserted.sentimentScore === null;
      if (isNew && upserted.content && upserted.content !== '(No comment)') {
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
              status: determineStatusFromSentiment(rating, sentiment.urgency, hasReply),
            },
          });
        } catch { /* keep existing tags/status on failure */ }
      }

      // Notify on new reviews
      if (isNew) {
        try {
          await notifyNewReview({
            businessId: platform.businessId,
            businessName: platform.business.name,
            reviewerName: gReview.reviewer.displayName,
            rating,
            content: gReview.comment ?? '',
            reviewId: upserted.id,
          });
        } catch { /* notification failure is non-critical */ }
      }

      // Sync existing reply from Google
      if (gReview.reviewReply) {
        const dbReview = await prisma.review.findUnique({
          where: { externalId: gReview.name },
        });
        if (dbReview) {
          await prisma.reply.upsert({
            where: { reviewId: dbReview.id },
            update: { content: gReview.reviewReply.comment },
            create: {
              content: gReview.reviewReply.comment,
              reviewId: dbReview.id,
              repliedAt: new Date(gReview.reviewReply.updateTime),
            },
          });
        }
      }

      synced++;
    } catch (err) {
      errors.push(`Failed to sync review ${gReview.reviewId}: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  }

  // Update lastSynced
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
 * Reply to a Google review via the API and save to DB.
 */
export async function replyToGoogleReview(
  reviewId: string,
  content: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });

  if (!review || review.platform !== 'GOOGLE' || !review.externalId) {
    return { success: false, error: 'Not a Google review or missing external ID' };
  }

  const accessToken = await getGoogleAccessToken(userId);
  if (!accessToken) {
    return { success: false, error: 'No valid Google access token' };
  }

  try {
    await replyToGoogleReviewAPI(accessToken, review.externalId, content);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'RATE_LIMITED') {
      return { success: false, error: 'Google API rate limit. Please try again later.' };
    }
    return { success: false, error: message };
  }

  // Save reply to DB
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
 * Sync all connected Google platforms.
 */
export async function syncAllGooglePlatforms(): Promise<{
  total: number;
  synced: number;
  errors: string[];
}> {
  const platforms = await prisma.platform.findMany({
    where: { type: 'GOOGLE', status: 'CONNECTED' },
  });

  let totalSynced = 0;
  const allErrors: string[] = [];

  for (const platform of platforms) {
    // Skip platforms without Google Business API config
    if (!platform.accountId || !platform.locationId) continue;

    const result = await syncGoogleReviews(platform.id);
    totalSynced += result.synced;
    allErrors.push(...result.errors);
  }

  return { total: platforms.length, synced: totalSynced, errors: allErrors };
}
