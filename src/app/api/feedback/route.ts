import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const { category, content, email } = await request.json();

    if (!category || !content) return errorResponse('Category and content are required');
    if (content.length > 500) return errorResponse('Content too long (max 500 characters)');

    const feedback = await prisma.feedback.create({
      data: {
        category,
        content,
        email: email || null,
        userId: session?.user?.id || null,
      },
    });

    return successResponse({ id: feedback.id }, 201);
  } catch {
    return errorResponse('Failed to submit feedback', 500);
  }
}
