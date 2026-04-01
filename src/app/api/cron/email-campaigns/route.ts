import type { NextRequest } from 'next/server';
import { processDripCampaigns } from '@/services/emailCampaignService';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const result = await processDripCampaigns();
    return successResponse(result);
  } catch (error) {
    console.error('Email campaign cron error:', error);
    return errorResponse('Cron failed', 500);
  }
}
