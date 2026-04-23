/**
 * @jest-environment node
 */
import { checkRateLimit, rateLimitOrResponse } from '../rateLimit';

function makeReq(ip = '1.1.1.1'): Request {
  return new Request('http://localhost/x', {
    headers: { 'x-forwarded-for': ip },
  });
}

describe('rateLimit', () => {
  it('allows up to max requests in window', () => {
    const opts = { name: 'test-a', windowMs: 1000, max: 3 };
    const req = makeReq('10.0.0.1');
    expect(checkRateLimit(req, opts).ok).toBe(true);
    expect(checkRateLimit(req, opts).ok).toBe(true);
    expect(checkRateLimit(req, opts).ok).toBe(true);
    const res = checkRateLimit(req, opts);
    expect(res.ok).toBe(false);
    expect(res.retryAfterSec).toBeGreaterThanOrEqual(1);
  });

  it('separates buckets by name and IP', () => {
    const opts1 = { name: 'test-b1', windowMs: 1000, max: 1 };
    const opts2 = { name: 'test-b2', windowMs: 1000, max: 1 };
    expect(checkRateLimit(makeReq('2.2.2.2'), opts1).ok).toBe(true);
    expect(checkRateLimit(makeReq('2.2.2.2'), opts1).ok).toBe(false);
    // different bucket name — independent count
    expect(checkRateLimit(makeReq('2.2.2.2'), opts2).ok).toBe(true);
    // different IP — independent count
    expect(checkRateLimit(makeReq('3.3.3.3'), opts1).ok).toBe(true);
  });

  it('rateLimitOrResponse returns 429 with Retry-After when exceeded', async () => {
    const opts = { name: 'test-c', windowMs: 1000, max: 1 };
    const req = makeReq('4.4.4.4');
    expect(rateLimitOrResponse(req, opts)).toBeNull();
    const res = rateLimitOrResponse(req, opts);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(429);
    expect(res!.headers.get('Retry-After')).toBeTruthy();
    const body = await res!.json();
    expect(body.error).toMatch(/too many/i);
  });
});
