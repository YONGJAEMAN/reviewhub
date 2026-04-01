import { prisma } from '@/lib/prisma';
import { PLAN_LIMITS } from '@/lib/stripe';

interface PlacesResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
}

/**
 * Search nearby businesses via Google Places API.
 */
export async function searchNearbyBusinesses(query: string): Promise<PlacesResult[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY not configured');

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Google Places API error');

  const data = await res.json();
  return (data.results ?? []).slice(0, 10).map((r: PlacesResult) => ({
    place_id: r.place_id,
    name: r.name,
    formatted_address: r.formatted_address,
    rating: r.rating ?? null,
    user_ratings_total: r.user_ratings_total ?? null,
  }));
}

/**
 * Add a competitor to track.
 */
export async function addCompetitor(
  businessId: string,
  data: { name: string; googlePlaceId: string; address?: string; rating?: number; totalReviews?: number }
) {
  // Check plan limit
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { subscription: true },
  });
  const plan = business?.subscription?.status === 'ACTIVE'
    ? business.subscription.plan
    : business?.subscription?.status === 'TRIALING' && business?.subscription?.trialEndsAt && new Date() < business.subscription.trialEndsAt
      ? 'GROWTH'
      : 'FREE';
  const limit = (PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE).competitors;

  if (limit !== -1) {
    const count = await prisma.competitor.count({ where: { businessId } });
    if (count >= limit) {
      throw new Error(`Plan limit reached (${limit} competitors). Upgrade to track more.`);
    }
  }

  return prisma.competitor.upsert({
    where: { businessId_googlePlaceId: { businessId, googlePlaceId: data.googlePlaceId } },
    update: { name: data.name, address: data.address, rating: data.rating, totalReviews: data.totalReviews },
    create: { ...data, businessId },
  });
}

/**
 * Get competitors for a business with latest snapshot.
 */
export async function getCompetitors(businessId: string) {
  return prisma.competitor.findMany({
    where: { businessId },
    include: {
      snapshots: { orderBy: { capturedAt: 'desc' }, take: 1 },
    },
    orderBy: { name: 'asc' },
  });
}

/**
 * Fetch fresh data for a competitor from Google Places and save snapshot.
 */
export async function refreshCompetitorData(competitorId: string) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY not configured');

  const competitor = await prisma.competitor.findUnique({ where: { id: competitorId } });
  if (!competitor) throw new Error('Competitor not found');

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${competitor.googlePlaceId}&fields=rating,user_ratings_total&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Google Places API error');

  const data = await res.json();
  const rating = data.result?.rating ?? competitor.rating ?? 0;
  const totalReviews = data.result?.user_ratings_total ?? competitor.totalReviews ?? 0;

  await prisma.competitor.update({
    where: { id: competitorId },
    data: { rating, totalReviews, lastFetched: new Date() },
  });

  await prisma.competitorSnapshot.create({
    data: { competitorId, rating, totalReviews },
  });

  return { rating, totalReviews };
}

/**
 * Get benchmark comparison: your business vs competitors.
 */
export async function getCompetitorBenchmark(businessId: string) {
  const [business, competitors] = await Promise.all([
    prisma.business.findUnique({
      where: { id: businessId },
      include: {
        reviews: { select: { rating: true }, where: { postedAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } } },
      },
    }),
    prisma.competitor.findMany({
      where: { businessId },
      include: { snapshots: { orderBy: { capturedAt: 'desc' }, take: 12 } },
    }),
  ]);

  if (!business) return null;

  const myReviews = business.reviews;
  const myAvgRating = myReviews.length > 0
    ? myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length
    : 0;

  return {
    myBusiness: {
      name: business.name,
      avgRating: Number(myAvgRating.toFixed(1)),
      totalReviews: myReviews.length,
    },
    competitors: competitors.map((c) => ({
      id: c.id,
      name: c.name,
      rating: c.rating,
      totalReviews: c.totalReviews,
      trend: c.snapshots.map((s) => ({ rating: s.rating, totalReviews: s.totalReviews, date: s.capturedAt })),
    })),
  };
}
