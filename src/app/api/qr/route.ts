import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getActiveBusinessId } from '@/lib/business';
import { successResponse, errorResponse } from '@/lib/api';
import { nanoid } from 'nanoid';

function generateCode(): string {
  return nanoid(8);
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse('Unauthorized', 401);

  const businessId = await getActiveBusinessId(
    session.user.id,
    request.nextUrl.searchParams.get('businessId') ?? undefined
  );
  if (!businessId) return errorResponse('No business found', 404);

  const qrCodes = await prisma.qrCode.findMany({
    where: { businessId },
    orderBy: { createdAt: 'desc' },
  });

  return successResponse(qrCodes);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse('Unauthorized', 401);

  const body = await request.json();
  const { businessId: bid, platform, reviewUrl } = body;

  const businessId = await getActiveBusinessId(session.user.id, bid);
  if (!businessId) return errorResponse('No business found', 404);

  if (!platform || !reviewUrl) {
    return errorResponse('Platform and review URL required', 400);
  }

  const code = generateCode();

  const qrCode = await prisma.qrCode.create({
    data: {
      code,
      platform,
      reviewUrl,
      businessId,
    },
  });

  return successResponse(qrCode);
}
