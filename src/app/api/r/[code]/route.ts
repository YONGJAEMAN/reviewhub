import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const qrCode = await prisma.qrCode.findUnique({
    where: { code },
    include: { business: { select: { name: true } } },
  });

  if (!qrCode) return errorResponse('Not found', 404);

  // Increment scan count
  await prisma.qrCode.update({
    where: { id: qrCode.id },
    data: { scanCount: { increment: 1 } },
  });

  return successResponse({
    businessName: qrCode.business.name,
    platform: qrCode.platform,
    reviewUrl: qrCode.reviewUrl,
  });
}
