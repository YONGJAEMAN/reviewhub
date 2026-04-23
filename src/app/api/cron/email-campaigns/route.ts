import type { NextRequest } from 'next/server';
import { processDripCampaigns } from '@/services/emailCampaignService';
import { successResponse, errorResponse } from '@/lib/api';
import { verifyCronAuth } from '@/lib/cronAuth';
import { captureError } from '@/lib/observability';

export async function GET(request: NextRequest) {
  const authGuard = verifyCronAuth(request);
  if (authGuard) return authGuard;

  try {
    const result = await processDripCampaigns();
    return successResponse(result);
  } catch (error) {
    captureError(error, { tag: 'cron:email-campaigns' });
    return errorResponse('Cron failed', 500);
  }
}
