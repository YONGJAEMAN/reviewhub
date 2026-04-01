import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getActiveBusinessId } from '@/lib/business';
import { getCompetitorBenchmark } from '@/services/competitorService';
import { successResponse, errorResponse } from '@/lib/api';
import Anthropic from '@anthropic-ai/sdk';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse('Unauthorized', 401);

  const businessId = await getActiveBusinessId(
    session.user.id,
    request.nextUrl.searchParams.get('businessId') ?? undefined
  );
  if (!businessId) return errorResponse('No business found', 404);

  const benchmark = await getCompetitorBenchmark(businessId);
  if (!benchmark || benchmark.competitors.length === 0) {
    return successResponse({ insights: 'No competitors tracked yet. Add competitors in Settings to get AI insights.' });
  }

  const prompt = `Analyze this competitive landscape for "${benchmark.myBusiness.name}" (avg rating: ${benchmark.myBusiness.avgRating}, reviews: ${benchmark.myBusiness.totalReviews}):

Competitors:
${benchmark.competitors.map((c) => `- ${c.name}: rating ${c.rating ?? 'N/A'}, ${c.totalReviews ?? 0} reviews`).join('\n')}

Provide 3-4 brief, actionable insights about competitive positioning. Keep it under 200 words. Use bullet points.`;

  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    return successResponse({ insights: text });
  } catch {
    return errorResponse('AI analysis unavailable', 500);
  }
}
