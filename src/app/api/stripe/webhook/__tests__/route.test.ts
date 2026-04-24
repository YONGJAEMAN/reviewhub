/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '../route';

const mockConstructEvent = jest.fn();
const mockRetrieve = jest.fn();
const mockUpsert = jest.fn();
const mockUpdateMany = jest.fn();

jest.mock('@/lib/stripe', () => ({
  getStripe: () => ({
    webhooks: { constructEvent: (...args: unknown[]) => mockConstructEvent(...args) },
    subscriptions: { retrieve: (...args: unknown[]) => mockRetrieve(...args) },
  }),
  getPlanFromPriceAmount: (amount: number) => amount >= 4900 ? 'PRO' : amount >= 2900 ? 'GROWTH' : 'STARTER',
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    subscription: {
      upsert: (...args: unknown[]) => mockUpsert(...args),
      updateMany: (...args: unknown[]) => mockUpdateMany(...args),
    },
  },
}));

function makeRequest(body = '', sig = 'sig-123') {
  return new NextRequest('http://localhost/api/stripe/webhook', {
    method: 'POST',
    body,
    headers: { 'stripe-signature': sig },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
});

describe('POST /api/stripe/webhook', () => {
  it('returns 400 when signature header missing', async () => {
    const req = new NextRequest('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: '',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when signature verification fails', async () => {
    mockConstructEvent.mockImplementation(() => { throw new Error('Invalid sig'); });
    const res = await POST(makeRequest());
    expect(res.status).toBe(400);
  });

  it('handles checkout.session.completed', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { businessId: 'biz-1', plan: 'GROWTH' },
          customer: 'cus_123',
          subscription: 'sub_123',
        },
      },
    });
    mockUpsert.mockResolvedValue({});

    const res = await POST(makeRequest());
    const json = await res.json();

    expect(json.received).toBe(true);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { businessId: 'biz-1' },
        update: expect.objectContaining({ plan: 'GROWTH', status: 'ACTIVE' }),
      })
    );
  });

  it('handles invoice.payment_succeeded', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'invoice.payment_succeeded',
      data: { object: { subscription: 'sub_123' } },
    });
    mockRetrieve.mockResolvedValue({
      current_period_end: 1700000000,
    });
    mockUpdateMany.mockResolvedValue({});

    const res = await POST(makeRequest());
    const json = await res.json();

    expect(json.received).toBe(true);
    expect(mockUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { stripeSubscriptionId: 'sub_123' },
        data: expect.objectContaining({ status: 'ACTIVE' }),
      })
    );
  });

  it('handles customer.subscription.deleted', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'customer.subscription.deleted',
      data: { object: { id: 'sub_123' } },
    });
    mockUpdateMany.mockResolvedValue({});

    const res = await POST(makeRequest());
    expect(mockUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: 'CANCELED', plan: 'FREE' },
      })
    );
  });

  it('handles customer.subscription.updated', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_123',
          status: 'active',
          current_period_end: 1700000000,
          items: { data: [{ price: { unit_amount: 4900 } }] },
        },
      },
    });
    mockUpdateMany.mockResolvedValue({});

    const res = await POST(makeRequest());
    expect(mockUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ plan: 'PRO', status: 'ACTIVE' }),
      })
    );
  });

  it('returns 500 on handler errors so Stripe retries', async () => {
    mockConstructEvent.mockReturnValue({
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: { object: { metadata: { businessId: 'biz-1' }, customer: 'c', subscription: 's' } },
    });
    mockUpsert.mockRejectedValue(new Error('DB error'));

    const res = await POST(makeRequest());
    expect(res.status).toBe(500);
  });

  it('maps invoice.payment_failed → PAST_DUE', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'invoice.payment_failed',
      data: { object: { subscription: 'sub_123' } },
    });
    mockUpdateMany.mockResolvedValue({});
    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    expect(mockUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { stripeSubscriptionId: 'sub_123' },
        data: { status: 'PAST_DUE' },
      }),
    );
  });

  it('maps subscription.updated status "past_due" correctly', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_123',
          status: 'past_due',
          current_period_end: 1700000000,
          items: { data: [{ price: { unit_amount: 4900 } }] },
        },
      },
    });
    mockUpdateMany.mockResolvedValue({});
    await POST(makeRequest());
    expect(mockUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'PAST_DUE' }),
      }),
    );
  });

  it('skips update when subscription.updated has unknown status', async () => {
    mockConstructEvent.mockReturnValue({
      id: 'evt_x',
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_bad',
          status: 'weird_new_status',
          current_period_end: 1700000000,
          items: { data: [{ price: { unit_amount: 1900 } }] },
        },
      },
    });
    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    // Should NOT silently coerce to ACTIVE — no update at all.
    expect(mockUpdateMany).not.toHaveBeenCalled();
  });
});
