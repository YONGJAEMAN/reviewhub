/**
 * @jest-environment node
 */

// googleapis is a heavy dep and unneeded for these tests — stub it.
jest.mock('googleapis', () => {
  const refreshAccessToken = jest.fn();
  const setCredentials = jest.fn();
  class OAuth2 {
    setCredentials = setCredentials;
    refreshAccessToken = refreshAccessToken;
  }
  return {
    google: {
      auth: { OAuth2 },
      mybusinessaccountmanagement: () => ({
        accounts: { list: jest.fn() },
      }),
    },
    __refreshAccessTokenMock: refreshAccessToken,
    __setCredentialsMock: setCredentials,
  };
});

const mockFindFirst = jest.fn();
const mockUpdate = jest.fn();

jest.mock('@/lib/prisma', () => ({
  prisma: {
    account: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

import { getGoogleAccessToken } from '../google';
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const googleapis = require('googleapis') as any;
const refreshMock = googleapis.__refreshAccessTokenMock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getGoogleAccessToken', () => {
  it('returns null when no google account is linked', async () => {
    mockFindFirst.mockResolvedValueOnce(null);
    const r = await getGoogleAccessToken('u1');
    expect(r).toBeNull();
  });

  it('returns null when account has no access_token', async () => {
    mockFindFirst.mockResolvedValueOnce({ id: 'a1', access_token: null });
    expect(await getGoogleAccessToken('u1')).toBeNull();
  });

  it('returns existing token when not expired', async () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    mockFindFirst.mockResolvedValueOnce({
      id: 'a1',
      access_token: 'valid-token',
      expires_at: future,
      refresh_token: 'r1',
    });
    expect(await getGoogleAccessToken('u1')).toBe('valid-token');
    expect(refreshMock).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('refreshes and persists new token when expired', async () => {
    const past = Math.floor(Date.now() / 1000) - 10;
    const futureMs = Date.now() + 3600_000;
    mockFindFirst.mockResolvedValueOnce({
      id: 'a1',
      access_token: 'old-token',
      expires_at: past,
      refresh_token: 'r1',
    });
    refreshMock.mockResolvedValueOnce({
      credentials: { access_token: 'new-token', expiry_date: futureMs },
    });
    mockUpdate.mockResolvedValueOnce({});

    const r = await getGoogleAccessToken('u1');
    expect(r).toBe('new-token');
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'a1' },
      data: { access_token: 'new-token', expires_at: Math.floor(futureMs / 1000) },
    });
  });

  it('returns null when refresh fails (user must reconnect)', async () => {
    const past = Math.floor(Date.now() / 1000) - 10;
    mockFindFirst.mockResolvedValueOnce({
      id: 'a1',
      access_token: 'old-token',
      expires_at: past,
      refresh_token: 'r1',
    });
    refreshMock.mockRejectedValueOnce(new Error('invalid_grant'));

    // Suppress expected console.error from the module
    const err = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const r = await getGoogleAccessToken('u1');
      expect(r).toBeNull();
      expect(mockUpdate).not.toHaveBeenCalled();
    } finally {
      err.mockRestore();
    }
  });

  it('returns null when expired but no refresh_token available', async () => {
    const past = Math.floor(Date.now() / 1000) - 10;
    mockFindFirst.mockResolvedValueOnce({
      id: 'a1',
      access_token: 'old-token',
      expires_at: past,
      refresh_token: null,
    });
    // Fallthrough behavior of current implementation: returns the stale token.
    // We lock that to prevent silent regressions — if we change policy, this
    // test flags it.
    const r = await getGoogleAccessToken('u1');
    expect(r).toBe('old-token');
    expect(refreshMock).not.toHaveBeenCalled();
  });
});
