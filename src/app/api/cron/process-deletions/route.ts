import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const pending = await prisma.accountDeletion.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: { lte: new Date() },
      },
    });

    let processed = 0;

    for (const deletion of pending) {
      try {
        // Delete all user data (cascades via Prisma relations)
        await prisma.user.delete({ where: { id: deletion.userId } });
        await prisma.accountDeletion.update({
          where: { id: deletion.id },
          data: { status: 'COMPLETED', completedAt: new Date() },
        });
        processed++;
      } catch {
        // User might already be deleted
      }
    }

    return successResponse({ processed, total: pending.length });
  } catch {
    return errorResponse('Failed to process deletions', 500);
  }
}
