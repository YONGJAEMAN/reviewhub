/**
 * @jest-environment node
 */
const mockCaptureError = jest.fn();
jest.mock('@/lib/observability', () => ({
  captureError: (...args: unknown[]) => mockCaptureError(...args),
}));

import { withTiming } from '../apiTiming';
import { NextResponse } from 'next/server';

beforeEach(() => jest.clearAllMocks());

function req() {
  return new Request('http://localhost/x', { method: 'GET' });
}

describe('withTiming', () => {
  it('passes through successful responses', async () => {
    const wrapped = withTiming('test.ok', async () => NextResponse.json({ ok: true }));
    const res = await wrapped(req(), {});
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(mockCaptureError).not.toHaveBeenCalled();
  });

  it('adds Server-Timing header', async () => {
    const wrapped = withTiming('test.hdr', async () => NextResponse.json({}));
    const res = await wrapped(req(), {});
    expect(res.headers.get('Server-Timing')).toMatch(/app;dur=\d+;desc="test\.hdr"/);
  });

  it('converts thrown errors to 500 and captures to Sentry', async () => {
    const wrapped = withTiming('test.err', async () => {
      throw new Error('boom');
    });
    const res = await wrapped(req(), {});
    expect(res.status).toBe(500);
    expect(mockCaptureError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ tag: 'api:test.err' }),
    );
  });

  it('warns when slowThresholdMs is exceeded', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const wrapped = withTiming(
        'test.slow',
        async () => {
          await new Promise((r) => setTimeout(r, 50));
          return NextResponse.json({});
        },
        { slowThresholdMs: 1 },
      );
      await wrapped(req(), {});
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('test.slow'));
    } finally {
      warn.mockRestore();
    }
  });
});
