import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    // Check if user is the first user (admin) or owns any business
    const userBiz = await prisma.userBusiness.findFirst({
      where: { userId: session.user.id, role: 'OWNER' },
    });
    if (!userBiz) return errorResponse('Forbidden', 403);

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
