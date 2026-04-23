/**
 * @jest-environment node
 */

// next-auth ships as ESM and pulls in heavy modules; stub it.
jest.mock('@/lib/auth', () => ({ auth: jest.fn() }));

import { getAdminEmails, isAdminEmail } from '../adminAuth';

describe('adminAuth allowlist', () => {
  const originalEnv = process.env.ADMIN_EMAILS;
  afterEach(() => {
    if (originalEnv === undefined) delete process.env.ADMIN_EMAILS;
    else process.env.ADMIN_EMAILS = originalEnv;
  });

  it('returns empty set when env not configured', () => {
    delete process.env.ADMIN_EMAILS;
    expect(getAdminEmails().size).toBe(0);
    expect(isAdminEmail('anyone@example.com')).toBe(false);
  });

  it('parses comma-separated list and trims', () => {
    process.env.ADMIN_EMAILS = ' a@x.com , b@y.com ,, c@z.com ';
    const set = getAdminEmails();
    expect(set.size).toBe(3);
    expect(set.has('a@x.com')).toBe(true);
    expect(set.has('b@y.com')).toBe(true);
  });

  it('is case-insensitive for lookup', () => {
    process.env.ADMIN_EMAILS = 'Admin@Example.COM';
    expect(isAdminEmail('admin@example.com')).toBe(true);
    expect(isAdminEmail('ADMIN@EXAMPLE.COM')).toBe(true);
    expect(isAdminEmail('other@example.com')).toBe(false);
  });

  it('rejects null/undefined/empty', () => {
    process.env.ADMIN_EMAILS = 'admin@example.com';
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
    expect(isAdminEmail('')).toBe(false);
  });
});
