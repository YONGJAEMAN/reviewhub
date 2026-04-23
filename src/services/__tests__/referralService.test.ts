/**
 * @jest-environment node
 */
import {
  generateReferralCode,
  ensureReferralCode,
  getReferralStats,
} from '../referralService';

const mockUserFindUnique = jest.fn();
const mockUserUpdate = jest.fn();
const mockReferralFindMany = jest.fn();

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      update: (...args: unknown[]) => mockUserUpdate(...args),
    },
    referral: {
      findMany: (...args: unknown[]) => mockReferralFindMany(...args),
    },
  },
}));

beforeEach(() => jest.clearAllMocks());

describe('generateReferralCode', () => {
  it('is prefixed with REF- and has uppercase suffix', () => {
    expect(generateReferralCode()).toMatch(/^REF-[A-Z0-9_-]{4}$/);
  });
});

describe('ensureReferralCode', () => {
  it('returns existing code when set', async () => {
    mockUserFindUnique.mockResolvedValueOnce({ referralCode: 'REF-AAAA' });
    const code = await ensureReferralCode('u1');
    expect(code).toBe('REF-AAAA');
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('generates and persists when missing', async () => {
    mockUserFindUnique
      .mockResolvedValueOnce({ referralCode: null }) // initial lookup
      .mockResolvedValueOnce(null); // uniqueness check returns no collision
    mockUserUpdate.mockResolvedValueOnce({});
    const code = await ensureReferralCode('u1');
    expect(code).toMatch(/^REF-/);
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { referralCode: code },
    });
  });
});

describe('getReferralStats', () => {
  it('aggregates counts by status', async () => {
    mockReferralFindMany.mockResolvedValueOnce([
      { status: 'PENDING', referred: { name: 'A', createdAt: new Date() } },
      { status: 'COMPLETED', referred: { name: 'B', createdAt: new Date() } },
      { status: 'COMPLETED', referred: { name: 'C', createdAt: new Date() } },
      { status: 'REWARDED', referred: { name: 'D', createdAt: new Date() } },
    ]);
    const stats = await getReferralStats('u1');
    expect(stats.total).toBe(4);
    expect(stats.pending).toBe(1);
    expect(stats.completed).toBe(2);
    expect(stats.rewarded).toBe(1);
  });
});
