import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWebhook, parseWebhookStatuses } from '@/lib/whatsapp';
import { successResponse, errorResponse } from '@/lib/api';

/**
 * GET — Meta webhook verification (subscribe handshake).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const result = verifyWebhook(mode, token, challenge);
  if (result !== null) {
    return new NextResponse(result, { status: 200 });
  }
  return errorResponse('Forbidden', 403);
}

/**
 * POST — Receive status updates (sent → delivered → read / failed).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const statuses = parseWebhookStatuses(body);

    const statusMap: Record<string, string> = {
      sent: 'SENT',
      delivered: 'DELIVERED',
      read: 'READ',
      failed: 'FAILED',
    };

    for (const s of statuses) {
      const dbStatus = statusMap[s.status];
      if (!dbStatus) continue;

      await prisma.reviewRequest.updateMany({
        where: { messageId: s.messageId },
        data: { status: dbStatus as 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' },
      });
    }

    return successResponse({ processed: statuses.length });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return successResponse({ status: 'ok' });
  }
}
