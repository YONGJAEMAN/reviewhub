import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { refreshCompetitorData } from '@/services/competitorService';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return errorResponse('Unauthorized', 401);
  }

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
      } catch {
        console.error(`Failed to refresh competitor ${c.name}`);
      }
    }

    return successResponse({ refreshed, total: competitors.length });
  } catch (error) {
    console.error('Competitor sync cron error:', error);
    return errorResponse('Cron failed', 500);
  }
}
