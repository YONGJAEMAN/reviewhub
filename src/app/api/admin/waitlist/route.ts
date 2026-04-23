import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET() {
  try {
    const guard = await requireAdmin();
    if (guard) return guard;

    const entries = await prisma.waitlist.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(entries);
  } catch {
    return errorResponse('Failed to fetch waitlist', 500);
  }
}
