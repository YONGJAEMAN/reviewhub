/**
 * @jest-environment node
 */
import { sendReviewRequest, verifyWebhook, parseWebhookStatuses } from '../whatsapp';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.WHATSAPP_API_TOKEN = 'test-token';
  process.env.WHATSAPP_PHONE_NUMBER_ID = 'phone-123';
  process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN = 'verify-token';
});

afterEach(() => {
  delete process.env.WHATSAPP_API_TOKEN;
  delete process.env.WHATSAPP_PHONE_NUMBER_ID;
  delete process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
});

describe('sendReviewRequest', () => {
  it('sends POST to correct WhatsApp API URL', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ messages: [{ id: 'msg-1' }] }),
    });

    await sendReviewRequest({
      phone: '+1234567890',
      customerName: 'Alice',
      businessName: 'Test Biz',
      reviewLink: 'https://g.page/r/xxx',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://graph.facebook.com/v19.0/phone-123/messages',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('includes Bearer auth header', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ messages: [{ id: 'msg-1' }] }),
    });

    await sendReviewRequest({
      phone: '+1234567890',
      customerName: 'Alice',
      businessName: 'Test Biz',
      reviewLink: 'https://g.page/r/xxx',
    });

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers.Authorization).toBe('Bearer test-token');
  });

  it('returns messageId from response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ messages: [{ id: 'msg-42' }] }),
    });

    const result = await sendReviewRequest({
      phone: '+1234567890',
      customerName: 'Bob',
      businessName: 'Biz',
      reviewLink: 'https://g.page/r/xxx',
    });

    expect(result.messageId).toBe('msg-42');
  });

  it('throws when response is not OK', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'bad request' }),
    });

    await expect(sendReviewRequest({
      phone: '+1',
      customerName: 'C',
      businessName: 'B',
      reviewLink: 'link',
    })).rejects.toThrow('WhatsApp send failed');
  });

  it('throws when env vars missing', () => {
    delete process.env.WHATSAPP_API_TOKEN;
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;

    expect(() => sendReviewRequest({
      phone: '+1',
      customerName: 'C',
      businessName: 'B',
      reviewLink: 'link',
    })).rejects.toThrow('WhatsApp API not configured');
  });
});

describe('verifyWebhook', () => {
  it('returns challenge when mode and token match', () => {
    const result = verifyWebhook('subscribe', 'verify-token', 'challenge-123');
    expect(result).toBe('challenge-123');
  });

  it('returns null when mode does not match', () => {
    const result = verifyWebhook('unsubscribe', 'verify-token', 'challenge-123');
    expect(result).toBeNull();
  });

  it('returns null when token does not match', () => {
    const result = verifyWebhook('subscribe', 'wrong-token', 'challenge-123');
    expect(result).toBeNull();
  });
});

describe('parseWebhookStatuses', () => {
  it('extracts statuses from nested payload', () => {
    const body = {
      entry: [{
        changes: [{
          value: {
            statuses: [
              { id: 'msg-1', status: 'delivered', timestamp: '1234567890' },
              { id: 'msg-2', status: 'read', timestamp: '1234567891' },
            ],
          },
        }],
      }],
    };

    const result = parseWebhookStatuses(body);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ messageId: 'msg-1', status: 'delivered', timestamp: '1234567890' });
    expect(result[1]).toEqual({ messageId: 'msg-2', status: 'read', timestamp: '1234567891' });
  });

  it('returns empty array for empty entry', () => {
    expect(parseWebhookStatuses({ entry: [] })).toEqual([]);
  });

  it('returns empty array for missing fields', () => {
    expect(parseWebhookStatuses({})).toEqual([]);
  });
});
