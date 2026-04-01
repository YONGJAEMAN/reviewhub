const YELP_BASE_URL = 'https://api.yelp.com/v3';

function getApiKey(): string {
  const key = process.env.YELP_API_KEY;
  if (!key) throw new Error('YELP_API_KEY not configured');
  return key;
}

export interface YelpReview {
  id: string;
  url: string;
  text: string;
  rating: number;
  time_created: string;
  user: {
    id: string;
    profile_url: string;
    image_url: string | null;
    name: string;
  };
}

export interface YelpBusiness {
  id: string;
  alias: string;
  name: string;
  image_url: string;
  url: string;
  review_count: number;
  rating: number;
  location: {
    display_address: string[];
  };
}

/**
 * Fetch reviews for a Yelp business (max 3 on free tier).
 */
export async function fetchYelpReviews(businessId: string): Promise<YelpReview[]> {
  const res = await fetch(`${YELP_BASE_URL}/businesses/${businessId}/reviews?sort_by=newest`, {
    headers: { Authorization: `Bearer ${getApiKey()}` },
  });

  if (res.status === 429) throw new Error('RATE_LIMITED');
  if (!res.ok) throw new Error(`Yelp API error: ${res.status}`);

  const data = await res.json();
  return data.reviews ?? [];
}

/**
 * Search for Yelp businesses by name and location.
 */
export async function searchYelpBusinesses(
  term: string,
  location: string
): Promise<YelpBusiness[]> {
  const params = new URLSearchParams({ term, location, limit: '5' });
  const res = await fetch(`${YELP_BASE_URL}/businesses/search?${params}`, {
    headers: { Authorization: `Bearer ${getApiKey()}` },
  });

  if (!res.ok) throw new Error(`Yelp search error: ${res.status}`);

  const data = await res.json();
  return data.businesses ?? [];
}
