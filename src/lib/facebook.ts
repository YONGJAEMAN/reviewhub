const FB_GRAPH_URL = 'https://graph.facebook.com/v19.0';

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
