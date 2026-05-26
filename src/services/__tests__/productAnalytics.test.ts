/**
 * @jest-environment node
 */
const mockCreate = jest.fn();
const mockFindMany = jest.fn();
const mockCapture = jest.fn();

jest.mock('@/lib/prisma', () => ({
  prisma: {
    analyticsEvent: {
      create: (...args: unknown[]) => mockCreate(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}));

jest.mock('@/lib/observability', () => ({
  captureError: (...args: unknown[]) => mockCapture(...args),
}));

import { trackEvent, getOnboardingFunnel, ANALYTICS_EVENTS } from '../productAnalytics';

beforeEach(() => jest.clearAllMocks());

describe('trackEvent', () => {
  it('persists event with sanitized properties', async () => {
    mockCreate.mockResolvedValue({});
    await trackEvent({
      name: 'onboarding.started',
      userId: 'u1',
      businessId: 'b1',
      properties: { source: 'organic', plan: 'FREE' },
    });
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'onboarding.started',
        userId: 'u1',
        businessId: 'b1',
        properties: { source: 'organic', plan: 'FREE' },
      }),
    });
  });

  it('never throws — failures go to Sentry only', async () => {
    mockCreate.mockRejectedValueOnce(new Error('DB down'));
    await expect(trackEvent({ name: 'pricing.viewed' })).resolves.toBeUndefined();
    expect(mockCapture).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ tag: 'product-analytics' }),
    );
  });

  it('handles minimal payload', async () => {
    mockCreate.mockResolvedValue({});
    await trackEvent({ name: 'pricing.viewed' });
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'pricing.viewed',
        userId: null,
        businessId: null,
        sessionId: null,
        properties: null,
      }),
    });
  });
});

describe('getOnboardingFunnel', () => {
  it('returns distinct user counts per step in order', async () => {
    mockFindMany
      .mockResolvedValueOnce([{ userId: 'a' }, { userId: 'b' }, { userId: 'c' }])
      .mockResolvedValueOnce([{ userId: 'a' }, { userId: 'b' }])
      .mockResolvedValueOnce([{ userId: 'a' }])
      .mockResolvedValueOnce([{ userId: 'a' }])
      .mockResolvedValueOnce([{ userId: 'a' }]);

    const out = await getOnboardingFunnel({
      from: new Date('2026-01-01'),
      to: new Date('2026-02-01'),
    });
    expect(out.map((r) => r.users)).toEqual([3, 2, 1, 1, 1]);
    expect(out[0].step).toBe('onboarding.started');
    expect(out[out.length - 1].step).toBe('onboarding.completed');
  });
});

describe('ANALYTICS_EVENTS constants', () => {
  it('exposes a stable set of event names', () => {
    expect(ANALYTICS_EVENTS.ONBOARDING_STARTED).toBe('onboarding.started');
    expect(ANALYTICS_EVENTS.PRICING_VIEWED).toBe('pricing.viewed');
    expect(ANALYTICS_EVENTS.CHECKOUT_STARTED).toBe('checkout.started');
  });
});
