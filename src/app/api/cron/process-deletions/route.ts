import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import { verifyCronAuth } from '@/lib/cronAuth';
import { captureError } from '@/lib/observability';

export async function GET(request: NextRequest) {
  const authGuard = verifyCronAuth(request);
  if (authGuard) return authGuard;

  try {
    const pending = await prisma.accountDeletion.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: { lte: new Date() },
      },
    });

    let processed = 0;
    const errors: Array<{ id: string; message: string }> = [];

    for (const deletion of pending) {
      try {
        // Delete all user data (cascades via Prisma relations)
        await prisma.user.delete({ where: { id: deletion.userId } });
        await prisma.accountDeletion.update({
          where: { id: deletion.id },
          data: { status: 'COMPLETED', completedAt: new Date() },
        });
        processed++;
      } catch (err) {
        // Capture per-row failures instead of silently swallowing.
        errors.push({
          id: deletion.id,
          message: err instanceof Error ? err.message : String(err),
        });
        captureError(err, {
          tag: 'cron:process-deletions',
          extra: { deletionId: deletion.id, userId: deletion.userId },
        });
      }
    }

    console.log(
      `[cron:process-deletions] ${processed}/${pending.length} completed` +
        (errors.length ? ` (${errors.length} errors)` : ''),
    );
    return successResponse({ processed, total: pending.length, errors });
  } catch (err) {
    captureError(err, { tag: 'cron:process-deletions' });
    return errorResponse('Failed to process deletions', 500);
  }
}
