/**
 * @jest-environment node
 */
const mockFindMany = jest.fn();
const mockUpdate = jest.fn();
const mockCreateNotification = jest.fn();

jest.mock('@/lib/prisma', () => ({
  prisma: {
    subscription: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

jest.mock('@/services/notificationService', () => ({
  createNotification: (...args: unknown[]) => mockCreateNotification(...args),
}));

import { expireStaleTrials } from '../trialService';

beforeEach(() => jest.clearAllMocks());

describe('expireStaleTrials', () => {
  it('selects only TRIALING rows with past trialEndsAt and null stripeSubscriptionId', async () => {
    mockFindMany.mockResolvedValueOnce([]);
    await expireStaleTrials();
    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.status).toBe('TRIALING');
    expect(whereArg.stripeSubscriptionId).toBeNull();
    expect(whereArg.trialEndsAt.lt).toBeInstanceOf(Date);
  });

  it('updates each stale sub to CANCELED + FREE and creates notification', async () => {
    mockFindMany.mockResolvedValueOnce([
      { id: 's1', business: { id: 'b1', name: 'Biz One' } },
      { id: 's2', business: { id: 'b2', name: 'Biz Two' } },
    ]);
    mockUpdate.mockResolvedValue({});
    mockCreateNotification.mockResolvedValue({});

    const r = await expireStaleTrials();
    expect(r.processed).toBe(2);
    expect(r.errors).toHaveLength(0);
    expect(mockUpdate).toHaveBeenCalledTimes(2);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 's1' },
      data: { status: 'CANCELED', plan: 'FREE' },
    });
    expect(mockCreateNotification).toHaveBeenCalledTimes(2);
    expect(mockCreateNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'PLAN_LIMIT',
        businessId: 'b1',
      }),
    );
  });

  it('collects per-row errors without aborting the batch', async () => {
    mockFindMany.mockResolvedValueOnce([
      { id: 's1', business: { id: 'b1', name: 'Biz One' } },
      { id: 's2', business: { id: 'b2', name: 'Biz Two' } },
    ]);
    mockUpdate
      .mockRejectedValueOnce(new Error('db conflict'))
      .mockResolvedValueOnce({});
    mockCreateNotification.mockResolvedValue({});

    const r = await expireStaleTrials();
    expect(r.processed).toBe(1);
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].subscriptionId).toBe('s1');
    expect(r.errors[0].message).toMatch(/db conflict/);
  });

  it('swallows notification failures without failing the transition', async () => {
    mockFindMany.mockResolvedValueOnce([
      { id: 's1', business: { id: 'b1', name: 'Biz One' } },
    ]);
    mockUpdate.mockResolvedValue({});
    mockCreateNotification.mockRejectedValueOnce(new Error('notif down'));

    const r = await expireStaleTrials();
    expect(r.processed).toBe(1);
    expect(r.errors).toHaveLength(0);
  });
});
