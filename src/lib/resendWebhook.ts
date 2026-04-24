import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Verify a Resend webhook signature (Svix format).
 *
 * Resend uses Svix under the hood. The signature is:
 *   base64(HMAC_SHA256(secret, `${svix-id}.${svix-timestamp}.${body}`))
 *
 * The `svix-signature` header may contain multiple space-separated values
 * like `v1,<sig1> v1,<sig2>`. We accept the first matching one.
 *
 * Secret format in the dashboard: `whsec_<base64>`. We strip the `whsec_`
 * prefix and base64-decode before HMAC, per Svix spec.
 *
 * Returns `true` when verified, `false` on any mismatch.
 */
export function verifyResendSignature(params: {
  body: string;
  svixId: string | null;
  svixTimestamp: string | null;
  svixSignature: string | null;
  secret: string;
}): boolean {
  const { body, svixId, svixTimestamp, svixSignature, secret } = params;
  if (!svixId || !svixTimestamp || !svixSignature) return false;

  // Reject replays outside a 5-minute window.
  const tsSec = Number(svixTimestamp);
  if (!Number.isFinite(tsSec)) return false;
  const skewMs = Math.abs(Date.now() - tsSec * 1000);
  if (skewMs > 5 * 60 * 1000) return false;

  const secretBytes = secret.startsWith('whsec_')
    ? Buffer.from(secret.slice('whsec_'.length), 'base64')
    : Buffer.from(secret, 'utf8');

  const signed = `${svixId}.${svixTimestamp}.${body}`;
  const expected = createHmac('sha256', secretBytes).update(signed).digest('base64');
  const expectedBuf = Buffer.from(expected);

  for (const part of svixSignature.split(' ')) {
    const [, sig] = part.split(',', 2);
    if (!sig) continue;
    const provided = Buffer.from(sig);
    if (provided.length !== expectedBuf.length) continue;
    if (timingSafeEqual(provided, expectedBuf)) return true;
  }
  return false;
}
