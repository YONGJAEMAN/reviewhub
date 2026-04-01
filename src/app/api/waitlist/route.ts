import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';

export async function POST(request: Request) {
  try {
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
