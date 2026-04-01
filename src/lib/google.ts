import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';

const GOOGLE_BUSINESS_SCOPE = 'https://www.googleapis.com/auth/business.manage';

export { GOOGLE_BUSINESS_SCOPE };

export function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
}

/**
 * Get a valid access token for a user's Google account.
 * Refreshes automatically if expired.
 */
export async function getGoogleAccessToken(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: 'google' },
  });

  if (!account?.access_token) return null;

  // Check if token is expired (expires_at is in seconds)
  const isExpired = account.expires_at && account.expires_at * 1000 < Date.now();

  if (isExpired && account.refresh_token) {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: account.refresh_token });

    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      const newAccessToken = credentials.access_token!;
      const newExpiresAt = credentials.expiry_date
        ? Math.floor(credentials.expiry_date / 1000)
        : undefined;

      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: newAccessToken,
          expires_at: newExpiresAt,
        },
      });

      return newAccessToken;
    } catch (error) {
      console.error('Failed to refresh Google token:', error);
      return null;
    }
  }

  return account.access_token;
}

/**
 * List Google Business accounts for the authenticated user.
 */
export async function listGoogleAccounts(accessToken: string) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  const mybusiness = google.mybusinessaccountmanagement({ version: 'v1', auth: oauth2Client });
  const res = await mybusiness.accounts.list();
  return res.data.accounts ?? [];
}

/**
 * List locations for a Google Business account.
 */
export async function listGoogleLocations(accessToken: string, accountId: string) {
  const res = await fetch(
    `https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations?readMask=name,title,storefrontAddress`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`Failed to list locations: ${res.status}`);
  const data = await res.json();
  return data.locations ?? [];
}

/**
 * Fetch reviews for a Google Business location.
 */
export async function fetchGoogleReviewsAPI(accessToken: string, locationName: string) {
  const res = await fetch(
    `https://mybusiness.googleapis.com/v4/${locationName}/reviews`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (res.status === 429) {
    throw new Error('RATE_LIMITED');
  }
  if (!res.ok) throw new Error(`Failed to fetch reviews: ${res.status}`);

  const data = await res.json();
  return data.reviews ?? [];
}

/**
 * Reply to a Google review.
 */
export async function replyToGoogleReviewAPI(
  accessToken: string,
  reviewName: string,
  comment: string
) {
  const res = await fetch(
    `https://mybusiness.googleapis.com/v4/${reviewName}/reply`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment }),
    }
  );

  if (res.status === 429) {
    throw new Error('RATE_LIMITED');
  }
  if (!res.ok) throw new Error(`Failed to reply: ${res.status}`);

  return res.json();
}
