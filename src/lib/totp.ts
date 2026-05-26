import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * RFC 6238 TOTP — 6-digit, 30-second window, HMAC-SHA1.
 *
 * Standalone implementation (no extra dep) since the project already has
 * `qrcode` for the otpauth:// URL. Compatible with Google Authenticator,
 * Authy, 1Password, etc.
 */

const PERIOD_SEC = 30;
const DIGITS = 6;
const ALGO = 'SHA1';

// RFC 4648 base32 (no padding) — used by otpauth URIs.
const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(s: string): Buffer {
  const clean = s.toUpperCase().replace(/=+$/g, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const ch of clean) {
    const idx = BASE32.indexOf(ch);
    if (idx < 0) throw new Error('Invalid base32 character');
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/** Generate a fresh 20-byte secret, base32-encoded. */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

/** Compute the 6-digit code for a secret at a given time (seconds since epoch). */
export function totpCode(secret: string, atSec: number = Math.floor(Date.now() / 1000)): string {
  const counter = Math.floor(atSec / PERIOD_SEC);
  const key = base32Decode(secret);
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac(ALGO.toLowerCase(), key).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  const code = binary % 10 ** DIGITS;
  return code.toString().padStart(DIGITS, '0');
}

/**
 * Verify a user-provided 6-digit code against a secret, allowing ±1 step of
 * clock drift (so ±30s). Constant-time compare.
 */
export function verifyTotp(
  secret: string,
  providedCode: string,
  atSec: number = Math.floor(Date.now() / 1000),
): boolean {
  if (!/^\d{6}$/.test(providedCode)) return false;
  for (const drift of [-1, 0, 1]) {
    const expected = totpCode(secret, atSec + drift * PERIOD_SEC);
    const a = Buffer.from(expected);
    const b = Buffer.from(providedCode);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  return false;
}

/**
 * Build the otpauth:// URI users scan with their authenticator app.
 */
export function buildOtpauthUri(params: {
  secret: string;
  accountName: string;
  issuer: string;
}): string {
  const { secret, accountName, issuer } = params;
  const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}`;
  const qs = new URLSearchParams({
    secret,
    issuer,
    algorithm: ALGO,
    digits: String(DIGITS),
    period: String(PERIOD_SEC),
  });
  return `otpauth://totp/${label}?${qs.toString()}`;
}

/**
 * Generate N backup codes (8-character lowercase alphanumeric).
 * Display once on activation; we store bcrypt hashes only.
 */
export function generateBackupCodes(count = 10): string[] {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const buf = randomBytes(8);
    let code = '';
    for (let j = 0; j < 8; j++) code += chars[buf[j] % chars.length];
    // Format like "abcd-efgh" so it's easier to read.
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}
