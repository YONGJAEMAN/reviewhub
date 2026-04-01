import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyBusinessAccess } from '@/lib/business';
import { successResponse, errorResponse } from '@/lib/api';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse('Unauthorized', 401);

  const { id } = await params;

  const competitor = await prisma.competitor.findUnique({ where: { id } });
  if (!competitor) return errorResponse('Not found', 404);

  const access = await verifyBusinessAccess(session.user.id, competitor.businessId);
  if (!access) return errorResponse('Forbidden', 403);

  await prisma.competitorSnapshot.deleteMany({ where: { competitorId: id } });
  await prisma.competitor.delete({ where: { id } });

  return successResponse({ deleted: true });
}
