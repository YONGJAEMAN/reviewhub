/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET } from '../route';

const mockAuth = jest.fn();
const mockGetActiveBusinessId = jest.fn();
const mockGetReviews = jest.fn();

jest.mock('@/lib/auth', () => ({ auth: () => mockAuth() }));
jest.mock('@/lib/business', () => ({ getActiveBusinessId: (...args: unknown[]) => mockGetActiveBusinessId(...args) }));
jest.mock('@/services/reviewService', () => ({ getReviews: (...args: unknown[]) => mockGetReviews(...args) }));

function makeRequest(url = 'http://localhost/api/reviews') {
  return new NextRequest(url);
}

beforeEach(() => jest.clearAllMocks());

describe('GET /api/reviews', () => {
  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it('returns 404 when business not found', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockGetActiveBusinessId.mockResolvedValue(null);
    const res = await GET(makeRequest());
    expect(res.status).toBe(404);
  });

  it('passes parsed query params to getReviews', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockGetActiveBusinessId.mockResolvedValue('biz-1');
    mockGetReviews.mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 0 });

    const url = 'http://localhost/api/reviews?platform=google&rating=5&status=replied&page=2&limit=20';
    await GET(makeRequest(url));

    expect(mockGetReviews).toHaveBeenCalledWith(
      expect.objectContaining({ platform: 'google', rating: 5, status: 'replied' }),
      undefined,
      { page: 2, limit: 20 },
      'biz-1'
    );
  });

  it('returns success response with reviews', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockGetActiveBusinessId.mockResolvedValue('biz-1');
    const mockData = { data: [{ id: 'r1' }], total: 1, page: 1, totalPages: 1 };
    mockGetReviews.mockResolvedValue(mockData);

    const res = await GET(makeRequest());
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.total).toBe(1);
  });
});
