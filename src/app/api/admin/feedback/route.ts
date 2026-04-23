import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET() {
  try {
    const guard = await requireAdmin();
    if (guard) return guard;

    const items = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(items);
  } catch {
    return errorResponse('Failed to fetch feedback', 500);
  }
}
