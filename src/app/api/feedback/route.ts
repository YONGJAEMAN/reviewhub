import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import { rateLimitOrResponse } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const limited = rateLimitOrResponse(request, {
      name: 'feedback',
      windowMs: 10 * 60 * 1000, // 10 min
      max: 10,
    });
    if (limited) return limited;

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
