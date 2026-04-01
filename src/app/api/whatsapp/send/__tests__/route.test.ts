/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '../route';

const mockAuth = jest.fn();
const mockGetActiveBusinessId = jest.fn();
const mockCheckPlanLimit = jest.fn();
const mockSendReviewRequest = jest.fn();
const mockCreate = jest.fn();

jest.mock('@/lib/auth', () => ({ auth: () => mockAuth() }));
jest.mock('@/lib/business', () => ({ getActiveBusinessId: (...args: unknown[]) => mockGetActiveBusinessId(...args) }));
jest.mock('@/lib/planLimits', () => ({ checkPlanLimit: (...args: unknown[]) => mockCheckPlanLimit(...args) }));
jest.mock('@/lib/whatsapp', () => ({ sendReviewRequest: (...args: unknown[]) => mockSendReviewRequest(...args) }));
jest.mock('@/lib/prisma', () => ({
  prisma: { reviewRequest: { create: (...args: unknown[]) => mockCreate(...args) } },
}));

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/whatsapp/send', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => jest.clearAllMocks());

describe('POST /api/whatsapp/send', () => {
  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(401);
  });

  it('returns 404 when business not found', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockGetActiveBusinessId.mockResolvedValue(null);
    const res = await POST(makeRequest({ phone: '123' }));
    expect(res.status).toBe(404);
  });

  it('returns 429 when plan limit exceeded', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockGetActiveBusinessId.mockResolvedValue('biz-1');
    mockCheckPlanLimit.mockResolvedValue({ allowed: false, limit: 10 });

    const res = await POST(makeRequest({ phone: '123', customerName: 'A', businessName: 'B', reviewLink: 'L' }));
    expect(res.status).toBe(429);
  });

  it('returns 400 when required fields missing', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockGetActiveBusinessId.mockResolvedValue('biz-1');
    mockCheckPlanLimit.mockResolvedValue({ allowed: true });

    const res = await POST(makeRequest({ phone: '123' }));
    expect(res.status).toBe(400);
  });

  it('sends message and creates DB record on success', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockGetActiveBusinessId.mockResolvedValue('biz-1');
    mockCheckPlanLimit.mockResolvedValue({ allowed: true });
    mockSendReviewRequest.mockResolvedValue({ messageId: 'msg-1' });
    mockCreate.mockResolvedValue({ id: 'req-1' });

    const res = await POST(makeRequest({
      phone: '+1234567890',
      customerName: 'Alice',
      businessName: 'Test',
      reviewLink: 'https://g.page/r/xxx',
    }));

    expect(res.status).toBe(201);
    expect(mockSendReviewRequest).toHaveBeenCalled();
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          phone: '+1234567890',
          status: 'SENT',
          businessId: 'biz-1',
        }),
      })
    );
  });
});
