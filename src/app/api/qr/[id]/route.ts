import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyBusinessAccess } from '@/lib/business';
import { successResponse, errorResponse } from '@/lib/api';
import QRCode from 'qrcode';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const qrCode = await prisma.qrCode.findUnique({ where: { id } });
  if (!qrCode) return errorResponse('Not found', 404);

  const origin = request.nextUrl.origin;
  const qrUrl = `${origin}/r/${qrCode.code}`;

  const svg = await QRCode.toString(qrUrl, { type: 'svg', width: 256, margin: 2 });

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse('Unauthorized', 401);

  const { id } = await params;

  const qrCode = await prisma.qrCode.findUnique({ where: { id } });
  if (!qrCode) return errorResponse('Not found', 404);

  const access = await verifyBusinessAccess(session.user.id, qrCode.businessId);
  if (!access) return errorResponse('Forbidden', 403);

  await prisma.qrCode.delete({ where: { id } });
  return successResponse({ deleted: true });
}
