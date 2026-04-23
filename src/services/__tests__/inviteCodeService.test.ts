/**
 * @jest-environment node
 */
import {
  generateCode,
  validateInviteCode,
  redeemInviteCode,
} from '../inviteCodeService';

const mockFindUnique = jest.fn();
const mockUpdate = jest.fn();
const mockCreate = jest.fn();

jest.mock('@/lib/prisma', () => ({
  prisma: {
    inviteCode: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

beforeEach(() => jest.clearAllMocks());

describe('generateCode', () => {
  it('prefixes with BETA- and has 6 suffix chars', () => {
    const code = generateCode();
    expect(code).toMatch(/^BETA-[A-Z0-9_-]{6}$/);
  });
  it('generates unique values across invocations', () => {
    const set = new Set(Array.from({ length: 20 }, () => generateCode()));
    expect(set.size).toBe(20);
  });
});

describe('validateInviteCode', () => {
  it('rejects unknown code', async () => {
    mockFindUnique.mockResolvedValue(null);
    const r = await validateInviteCode('UNKNOWN');
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/invalid/i);
  });

  it('rejects exhausted code', async () => {
    mockFindUnique.mockResolvedValue({
      code: 'X',
      useCount: 1,
      maxUses: 1,
      expiresAt: null,
    });
    const r = await validateInviteCode('X');
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/used/i);
  });

  it('rejects expired code', async () => {
    mockFindUnique.mockResolvedValue({
      code: 'X',
      useCount: 0,
      maxUses: 1,
      expiresAt: new Date(Date.now() - 1000),
    });
    const r = await validateInviteCode('X');
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/expired/i);
  });

  it('accepts fresh code', async () => {
    mockFindUnique.mockResolvedValue({
      code: 'X',
      useCount: 0,
      maxUses: 3,
      expiresAt: new Date(Date.now() + 60_000),
    });
    const r = await validateInviteCode('X');
    expect(r.valid).toBe(true);
  });
});

describe('redeemInviteCode', () => {
  it('updates usage count and usedBy', async () => {
    mockUpdate.mockResolvedValue({});
    await redeemInviteCode('ABC', 'user-1');
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { code: 'ABC' },
      data: expect.objectContaining({
        usedBy: 'user-1',
        useCount: { increment: 1 },
      }),
    });
  });
});
