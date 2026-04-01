import crypto from 'crypto';

const SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret';

export function generateUnsubscribeToken(userId: string): string {
  const hmac = crypto.createHmac('sha256', SECRET);
  hmac.update(userId);
  return hmac.digest('hex');
}

export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  const expected = generateUnsubscribeToken(userId);
  if (expected.length !== token.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}

export function getUnsubscribeUrl(userId: string): string {
  const token = generateUnsubscribeToken(userId);
  const baseUrl = process.env.NEXTAUTH_URL || 'https://reviewhub.app';
  return `${baseUrl}/unsubscribe/${token}?uid=${userId}`;
}
