import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import { rateLimitOrResponse } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const limited = rateLimitOrResponse(request, {
      name: 'waitlist',
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5,
    });
    if (limited) return limited;

    const { email, name, company } = await request.json();
    if (!email) return errorResponse('Email is required');

    const existing = await prisma.waitlist.findUnique({ where: { email } });
    if (existing) return errorResponse('This email is already on the waitlist');

    const entry = await prisma.waitlist.create({
      data: { email, name: name || null, company: company || null },
    });

    return successResponse({ id: entry.id }, 201);
  } catch {
    return errorResponse('Failed to join waitlist', 500);
  }
}
