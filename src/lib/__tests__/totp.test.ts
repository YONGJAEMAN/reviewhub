/**
 * @jest-environment node
 */
import {
  generateTotpSecret,
  totpCode,
  verifyTotp,
  buildOtpauthUri,
  generateBackupCodes,
} from '../totp';

describe('totp', () => {
  describe('generateTotpSecret', () => {
    it('returns a base32 string of expected length', () => {
      const s = generateTotpSecret();
      // 20 bytes = 32 base32 chars (no padding).
      expect(s).toMatch(/^[A-Z2-7]{32}$/);
    });
    it('produces unique secrets', () => {
      const set = new Set(Array.from({ length: 10 }, () => generateTotpSecret()));
      expect(set.size).toBe(10);
    });
  });

  describe('totpCode', () => {
    // RFC 6238 test vector — secret "12345678901234567890" -> base32 GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ
    // T=59  -> 94287082 (sha1)
    // T=1111111109 -> 07081804
    it('matches RFC 6238 vectors (SHA-1)', () => {
      const secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
      expect(totpCode(secret, 59).padStart(8, '0')).toContain('287082');
      expect(totpCode(secret, 1111111109).padStart(8, '0')).toContain('081804');
    });
    it('outputs exactly 6 digits', () => {
      const s = generateTotpSecret();
      expect(totpCode(s)).toMatch(/^\d{6}$/);
    });
  });

  describe('verifyTotp', () => {
    const secret = generateTotpSecret();
    const now = Math.floor(Date.now() / 1000);

    it('accepts current window', () => {
      expect(verifyTotp(secret, totpCode(secret, now), now)).toBe(true);
    });
    it('accepts ±1 step drift', () => {
      expect(verifyTotp(secret, totpCode(secret, now - 30), now)).toBe(true);
      expect(verifyTotp(secret, totpCode(secret, now + 30), now)).toBe(true);
    });
    it('rejects beyond drift window', () => {
      expect(verifyTotp(secret, totpCode(secret, now - 90), now)).toBe(false);
    });
    it('rejects non-6-digit input', () => {
      expect(verifyTotp(secret, '12345', now)).toBe(false);
      expect(verifyTotp(secret, '1234567', now)).toBe(false);
      expect(verifyTotp(secret, 'abcdef', now)).toBe(false);
    });
  });

  describe('buildOtpauthUri', () => {
    it('produces a scannable otpauth URI', () => {
      const uri = buildOtpauthUri({
        secret: 'JBSWY3DPEHPK3PXP',
        accountName: 'user@example.com',
        issuer: 'ReviewHub',
      });
      expect(uri).toMatch(/^otpauth:\/\/totp\/ReviewHub:user%40example\.com\?/);
      expect(uri).toContain('secret=JBSWY3DPEHPK3PXP');
      expect(uri).toContain('issuer=ReviewHub');
      expect(uri).toContain('algorithm=SHA1');
      expect(uri).toContain('digits=6');
      expect(uri).toContain('period=30');
    });
  });

  describe('generateBackupCodes', () => {
    it('produces N unique formatted codes', () => {
      const codes = generateBackupCodes(10);
      expect(codes).toHaveLength(10);
      for (const c of codes) {
        expect(c).toMatch(/^[a-z0-9]{4}-[a-z0-9]{4}$/);
      }
      expect(new Set(codes).size).toBe(10);
    });
  });
});
