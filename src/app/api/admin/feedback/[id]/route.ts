import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const { status } = await request.json();

    const feedback = await prisma.feedback.update({
      where: { id },
      data: { status },
    });

    return successResponse(feedback);
  } catch {
    return errorResponse('Failed to update feedback', 500);
  }
}
