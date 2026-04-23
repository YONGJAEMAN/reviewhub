import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET() {
  try {
    const guard = await requireAdmin();
    if (guard) return guard;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        onboardingCompleted: true,
        _count: { select: { businesses: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(users);
  } catch {
    return errorResponse('Failed to fetch users', 500);
  }
}
