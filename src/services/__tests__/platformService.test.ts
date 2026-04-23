/**
 * @jest-environment node
 */
import {
  getPlatforms,
  connectPlatform,
  disconnectPlatform,
  syncPlatform,
} from '../platformService';

const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();
const mockUpdate = jest.fn();

jest.mock('@/lib/prisma', () => ({
  prisma: {
    platform: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

const baseRow = {
  id: 'p1',
  type: 'GOOGLE',
  name: 'My Business',
  status: 'CONNECTED',
  detail: 'synced',
  lastSynced: new Date('2025-01-01T00:00:00Z'),
};

beforeEach(() => jest.clearAllMocks());

describe('getPlatforms', () => {
  it('maps DB rows to frontend shape', async () => {
    mockFindMany.mockResolvedValueOnce([baseRow]);
    const result = await getPlatforms('biz-1');
    expect(result).toEqual([
      expect.objectContaining({
        id: 'p1',
        platform: 'google',
        name: 'My Business',
        connected: true,
        detail: 'synced',
        lastSynced: '2025-01-01T00:00:00.000Z',
      }),
    ]);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { businessId: 'biz-1' } }),
    );
  });

  it('omits where clause when no businessId', async () => {
    mockFindMany.mockResolvedValueOnce([]);
    await getPlatforms();
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined }),
    );
  });

  it('reports connected=false for disconnected rows', async () => {
    mockFindMany.mockResolvedValueOnce([{ ...baseRow, status: 'DISCONNECTED' }]);
    const [r] = await getPlatforms();
    expect(r.connected).toBe(false);
  });
});

describe('connectPlatform', () => {
  it('sets status to CONNECTED', async () => {
    mockUpdate.mockResolvedValueOnce({ ...baseRow, status: 'CONNECTED' });
    const r = await connectPlatform('p1');
    expect(r?.connected).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: expect.objectContaining({ status: 'CONNECTED' }),
    });
  });

  it('returns null on failure', async () => {
    mockUpdate.mockRejectedValueOnce(new Error('not found'));
    const r = await connectPlatform('p-missing');
    expect(r).toBeNull();
  });
});

describe('disconnectPlatform', () => {
  it('sets status to DISCONNECTED', async () => {
    mockUpdate.mockResolvedValueOnce({ ...baseRow, status: 'DISCONNECTED' });
    const r = await disconnectPlatform('p1');
    expect(r?.connected).toBe(false);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: expect.objectContaining({ status: 'DISCONNECTED' }),
    });
  });
});

describe('syncPlatform', () => {
  it('updates lastSynced and returns synced=true', async () => {
    mockFindUnique.mockResolvedValueOnce({ ...baseRow });
    mockUpdate.mockResolvedValueOnce({});
    const r = await syncPlatform('p1');
    expect(r).toEqual({ platform: 'google', synced: true });
  });

  it('returns synced=false when platform missing', async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    const r = await syncPlatform('missing');
    expect(r.synced).toBe(false);
  });
});
