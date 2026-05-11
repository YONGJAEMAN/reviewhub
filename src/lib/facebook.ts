const FB_GRAPH_URL = 'https://graph.facebook.com/v19.0';

/**
 * Exchange a short-lived user access token (returned from NextAuth's
 * Facebook provider) for a long-lived (~60-day) token.
 *
 * Reference:
 *   https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived
 *
 * Page tokens derived from a long-lived user token are themselves long-lived
 * (or never expire, for pages the user owns) — so this is the single point
 * where we need to refresh.
 */
export async function exchangeForLongLivedToken(shortLivedToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  const appId = process.env.FACEBOOK_CLIENT_ID;
  const appSecret = process.env.FACEBOOK_CLIENT_SECRET;
  if (!appId || !appSecret) throw new Error('FB app credentials not configured');

  const url = new URL(`${FB_GRAPH_URL}/oauth/access_token`);
  url.searchParams.set('grant_type', 'fb_exchange_token');
  url.searchParams.set('client_id', appId);
  url.searchParams.set('client_secret', appSecret);
  url.searchParams.set('fb_exchange_token', shortLivedToken);

  const res = await fetch(url.toString(), { method: 'GET' });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`FB token exchange failed: ${res.status} ${body}`);
  }
  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) throw new Error('FB token exchange: missing access_token in response');

  return {
    accessToken: data.access_token,
    // Default to 60 days if `expires_in` isn't returned (Facebook sometimes omits it).
    expiresIn: data.expires_in ?? 60 * 24 * 60 * 60,
  };
}


export interface FBPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
}

export interface FBRating {
  reviewer: {
    id: string;
    name: string;
  };
  rating?: number;
  recommendation_type?: 'positive' | 'negative';
  review_text?: string;
  created_time: string;
  open_graph_story?: {
    id: string;
  };
}

/**
 * List pages managed by the user.
 */
export async function listFacebookPages(userAccessToken: string): Promise<FBPage[]> {
  const res = await fetch(
    `${FB_GRAPH_URL}/me/accounts?fields=id,name,access_token,category`,
    { headers: { Authorization: `Bearer ${userAccessToken}` } }
  );
  if (!res.ok) throw new Error(`FB pages error: ${res.status}`);
  const data = await res.json();
  return data.data ?? [];
}

/**
 * Fetch ratings/reviews for a Facebook page.
 */
export async function fetchFacebookRatings(
  pageAccessToken: string,
  pageId: string
): Promise<FBRating[]> {
  const res = await fetch(
    `${FB_GRAPH_URL}/${pageId}/ratings?fields=reviewer,rating,recommendation_type,review_text,created_time,open_graph_story`,
    { headers: { Authorization: `Bearer ${pageAccessToken}` } }
  );

  if (res.status === 429) throw new Error('RATE_LIMITED');
  if (!res.ok) throw new Error(`FB ratings error: ${res.status}`);

  const data = await res.json();
  return data.data ?? [];
}

/**
 * Reply to a Facebook review via comments.
 */
export async function replyToFacebookReview(
  pageAccessToken: string,
  storyId: string,
  message: string
): Promise<void> {
  const res = await fetch(
    `${FB_GRAPH_URL}/${storyId}/comments`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pageAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    }
  );

  if (!res.ok) throw new Error(`FB reply error: ${res.status}`);
}
