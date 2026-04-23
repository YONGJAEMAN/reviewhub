/**
 * @jest-environment node
 */
import { verifyCronAuth } from '../cronAuth';

function req(auth?: string): Request {
  return new Request('http://localhost/x', {
    headers: auth ? { authorization: auth } : {},
  });
}

describe('verifyCronAuth', () => {
  const original = process.env.CRON_SECRET;
  beforeEach(() => {
    process.env.CRON_SECRET = 'top-secret-123';
  });
  afterEach(() => {
    if (original === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = original;
  });

  it('returns null (ok) on valid bearer token', () => {
    const r = verifyCronAuth(req('Bearer top-secret-123'));
    expect(r).toBeNull();
  });

  it('returns 401 on missing header', () => {
    const r = verifyCronAuth(req());
    expect(r?.status).toBe(401);
  });

  it('returns 401 on wrong token', () => {
    const r = verifyCronAuth(req('Bearer wrong-token'));
    expect(r?.status).toBe(401);
  });

  it('returns 401 on token with mismatched length', () => {
    const r = verifyCronAuth(req('Bearer short'));
    expect(r?.status).toBe(401);
  });

  it('throws if CRON_SECRET not configured', () => {
    delete process.env.CRON_SECRET;
    expect(() => verifyCronAuth(req('Bearer anything'))).toThrow(/CRON_SECRET/);
  });
});
