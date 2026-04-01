/**
 * @jest-environment node
 */
import { getReviews, getReviewById, createReply } from '../reviewService';

const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();
const mockCount = jest.fn();
const mockUpdate = jest.fn();
const mockUpsert = jest.fn();

jest.mock('@/lib/prisma', () => ({
  prisma: {
    review: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      count: (...args: unknown[]) => mockCount(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
    reply: {
      upsert: (...args: unknown[]) => mockUpsert(...args),
    },
  },
}));

const makeDbReview = (overrides = {}) => ({
  id: 'rev-1',
  platform: 'GOOGLE' as const,
  authorName: 'John Doe',
  authorAvatar: null,
  authorInitials: 'JD',
  isVerified: false,
  localGuide: false,
  reviewCount: null,
  rating: 4,
  title: null,
  content: 'Great service',
  tags: ['POSITIVE'],
  status: 'ACTION_REQUIRED' as const,
  postedAt: new Date('2025-01-01'),
  reply: null,
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

describe('getReviews', () => {
  it('returns paginated results with correct totalPages', async () => {
    mockFindMany.mockResolvedValue([makeDbReview()]);
    mockCount.mockResolvedValue(25);

    const result = await getReviews(undefined, undefined, { page: 1, limit: 10 });

    expect(result.total).toBe(25);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(3);
    expect(result.data).toHaveLength(1);
  });

  it('maps platform filter correctly', async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await getReviews({ platform: 'google' });

    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.platform).toBe('GOOGLE');
  });

  it('maps status filter correctly', async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await getReviews({ status: 'high_priority' });

    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.status).toBe('HIGH_PRIORITY');
  });

  it('builds search OR clause', async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await getReviews({ search: 'test' });

    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.OR).toHaveLength(3);
    expect(whereArg.OR[0].authorName.contains).toBe('test');
  });

  it('sorts by rating when specified', async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await getReviews(undefined, { field: 'rating', order: 'asc' });

    const orderBy = mockFindMany.mock.calls[0][0].orderBy;
    expect(orderBy[0].rating).toBe('asc');
  });

  it('defaults to postedAt desc sort', async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await getReviews();

    const orderBy = mockFindMany.mock.calls[0][0].orderBy;
    expect(orderBy[0].postedAt).toBe('desc');
  });

  it('ignores invalid platform filter', async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await getReviews({ platform: 'invalid' });

    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.platform).toBeUndefined();
  });
});

describe('getReviewById', () => {
  it('returns null when review not found', async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await getReviewById('nonexistent');
    expect(result).toBeNull();
  });

  it('returns transformed review', async () => {
    mockFindUnique.mockResolvedValue(makeDbReview());

    const result = await getReviewById('rev-1');
    expect(result).not.toBeNull();
    expect(result!.platform).toBe('google');
    expect(result!.status).toBe('action_required');
  });
});

describe('createReply', () => {
  it('returns null when review not found', async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await createReply('nonexistent', 'thanks');
    expect(result).toBeNull();
  });

  it('creates reply and updates status to REPLIED', async () => {
    mockFindUnique.mockResolvedValue(makeDbReview({ externalId: null }));
    mockUpsert.mockResolvedValue({});
    mockUpdate.mockResolvedValue(makeDbReview({ status: 'REPLIED', reply: { content: 'thanks', repliedAt: new Date() } }));

    const result = await createReply('rev-1', 'thanks');
    expect(result).not.toBeNull();
    expect(mockUpsert).toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'REPLIED' } })
    );
  });
});
