/**
 * @jest-environment node
 */
import { createHmac } from 'node:crypto';

const mockUpdateMany = jest.fn();
const mockWebhookEventCreate = jest.fn();
const mockCaptureError = jest.fn();

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { updateMany: (...args: unknown[]) => mockUpdateMany(...args) },
    webhookEvent: { create: (...args: unknown[]) => mockWebhookEventCreate(...args) },
  },
}));

jest.mock('@/lib/observability', () => ({
  captureError: (...args: unknown[]) => mockCaptureError(...args),
}));

import { NextRequest } from 'next/server';
import { POST } from '../route';

const SECRET = 'whsec_dGVzdC1zZWNyZXQ='; // base64 of 'test-secret'
const RAW_SECRET = 'test-secret';

function signedRequest(body: string, opts: { id?: string; ts?: string } = {}) {
  const id = opts.id ?? 'msg_1';
  const ts = opts.ts ?? String(Math.floor(Date.now() / 1000));
  const sig = createHmac('sha256', Buffer.from(RAW_SECRET, 'utf8'))
    .update(`${id}.${ts}.${body}`)
    .digest('base64');
  return new NextRequest('http://localhost/api/resend/webhook', {
    method: 'POST',
    body,
    headers: {
      'svix-id': id,
      'svix-timestamp': ts,
      'svix-signature': `v1,${sig}`,
      'content-type': 'application/json',
    },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.RESEND_WEBHOOK_SECRET = SECRET;
  mockWebhookEventCreate.mockResolvedValue({});
  mockUpdateMany.mockResolvedValue({ count: 1 });
});

describe('POST /api/resend/webhook', () => {
  it('rejects invalid signature', async () => {
    const body = JSON.stringify({ type: 'email.bounced', data: {} });
    const req = new NextRequest('http://localhost/api/resend/webhook', {
      method: 'POST',
      body,
      headers: { 'svix-id': 'x', 'svix-timestamp': '1', 'svix-signature': 'v1,bad' },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('opts out user on hard bounce', async () => {
    const body = JSON.stringify({
      type: 'email.bounced',
      data: {
        email_id: 'em_1',
        to: ['user@example.com'],
        bounce: { type: 'hard_bounce' },
      },
    });
    const res = await POST(signedRequest(body));
    expect(res.status).toBe(200);
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      data: { marketingOptOut: true },
    });
  });

  it('skips soft bounce without opting out', async () => {
    const body = JSON.stringify({
      type: 'email.bounced',
      data: {
        email_id: 'em_2',
        to: ['user@example.com'],
        bounce: { type: 'soft_bounce' },
      },
    });
    const res = await POST(signedRequest(body));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.skipped).toMatch(/soft/);
    expect(mockUpdateMany).not.toHaveBeenCalled();
  });

  it('opts out user on complaint', async () => {
    const body = JSON.stringify({
      type: 'email.complained',
      data: { email_id: 'em_3', to: ['user@example.com'] },
    });
    const res = await POST(signedRequest(body));
    expect(res.status).toBe(200);
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      data: { marketingOptOut: true },
    });
  });

  it('ignores other event types', async () => {
    const body = JSON.stringify({
      type: 'email.delivered',
      data: { email_id: 'em_4', to: ['user@example.com'] },
    });
    const res = await POST(signedRequest(body));
    expect(res.status).toBe(200);
    expect(mockUpdateMany).not.toHaveBeenCalled();
  });

  it('returns duplicate=true for already-processed event id', async () => {
    mockWebhookEventCreate.mockRejectedValueOnce(new Error('Unique constraint'));
    const body = JSON.stringify({
      type: 'email.complained',
      data: { email_id: 'em_dup', to: ['user@example.com'] },
    });
    const res = await POST(signedRequest(body));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.duplicate).toBe(true);
    expect(mockUpdateMany).not.toHaveBeenCalled();
  });

  it('returns 400 on invalid JSON body (with valid signature)', async () => {
    const bad = '{"type":'; // truncated
    const res = await POST(signedRequest(bad));
    expect(res.status).toBe(400);
  });

  it('returns 500 on DB failure (so Resend retries)', async () => {
    mockUpdateMany.mockRejectedValueOnce(new Error('DB down'));
    const body = JSON.stringify({
      type: 'email.complained',
      data: { email_id: 'em_5', to: ['user@example.com'] },
    });
    const res = await POST(signedRequest(body));
    expect(res.status).toBe(500);
    expect(mockCaptureError).toHaveBeenCalled();
  });
});
