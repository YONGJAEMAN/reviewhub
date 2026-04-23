import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { refreshCompetitorData } from '@/services/competitorService';
import { successResponse, errorResponse } from '@/lib/api';
import { verifyCronAuth } from '@/lib/cronAuth';
import { captureError } from '@/lib/observability';

export async function GET(request: NextRequest) {
  const authGuard = verifyCronAuth(request);
  if (authGuard) return authGuard;

  try {
    const competitors = await prisma.competitor.findMany({
      where: {
        OR: [
          { lastFetched: null },
          { lastFetched: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        ],
      },
      take: 50,
    });

    let refreshed = 0;
    for (const c of competitors) {
      try {
        await refreshCompetitorData(c.id);
        refreshed++;
      } catch (err) {
        captureError(err, {
          tag: 'cron:sync-competitors',
          extra: { competitorId: c.id, name: c.name },
        });
      }
    }

    return successResponse({ refreshed, total: competitors.length });
  } catch (error) {
    captureError(error, { tag: 'cron:sync-competitors' });
    return errorResponse('Cron failed', 500);
  }
}
