/**
 * @jest-environment node
 */
import { checkEnv, hasEnv, requireEnv } from '../env';

describe('env', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('hasEnv', () => {
    it('returns true for non-empty value', () => {
      process.env.SOME_KEY_X = 'value';
      expect(hasEnv('SOME_KEY_X')).toBe(true);
    });
    it('returns false for missing value', () => {
      delete process.env.SOME_KEY_Y;
      expect(hasEnv('SOME_KEY_Y')).toBe(false);
    });
    it('returns false for empty string', () => {
      process.env.SOME_KEY_Z = '';
      expect(hasEnv('SOME_KEY_Z')).toBe(false);
    });
  });

  describe('requireEnv', () => {
    it('returns value when present', () => {
      process.env.DATABASE_URL = 'postgres://x';
      expect(requireEnv('DATABASE_URL')).toBe('postgres://x');
    });
    it('throws with helpful message when missing', () => {
      delete process.env.STRIPE_SECRET_KEY;
      expect(() => requireEnv('STRIPE_SECRET_KEY')).toThrow(/STRIPE_SECRET_KEY/);
      expect(() => requireEnv('STRIPE_SECRET_KEY')).toThrow(/Stripe/);
    });
  });

  describe('checkEnv', () => {
    it('reports ok when critical vars set', () => {
      process.env.DATABASE_URL = 'postgres://x';
      process.env.NEXTAUTH_SECRET = 'secret';
      const r = checkEnv();
      expect(r.ok).toBe(true);
      expect(r.missingCritical).toHaveLength(0);
    });
    it('reports missing critical when DATABASE_URL absent', () => {
      delete process.env.DATABASE_URL;
      process.env.NEXTAUTH_SECRET = 'secret';
      const r = checkEnv();
      expect(r.ok).toBe(false);
      expect(r.missingCritical.map((s) => s.key)).toContain('DATABASE_URL');
    });
  });
});
