import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import { requireAdmin } from '@/lib/adminAuth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireAdmin();
    if (guard) return guard;

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
