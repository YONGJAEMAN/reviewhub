import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAIClient, AI_MODEL } from '@/lib/ai';
import { checkPlanLimit } from '@/lib/planLimits';
import { getActiveBusinessId } from '@/lib/business';
import { successResponse, errorResponse } from '@/lib/api';

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    const { reviewContent, reviewRating, reviewerName, businessName, tone, length, businessId: reqBusinessId } = body;

    if (!reviewContent || !reviewRating || !reviewerName) {
      return errorResponse('reviewContent, reviewRating, and reviewerName are required', 400);
    }

    const businessId = await getActiveBusinessId(session.user.id, reqBusinessId);
    if (!businessId) return errorResponse('Business not found', 404);

    // Check plan limit
    const limitCheck = await checkPlanLimit(businessId, 'aiReplies', session.user.id);
    if (!limitCheck.allowed) {
      const msg = limitCheck.limit === -1
        ? 'AI reply limit reached.'
        : `AI reply limit reached (${limitCheck.limit}/month). Upgrade your plan for more.`;
      return errorResponse(msg, 429);
    }

    // Build prompt
    const toneMap: Record<string, string> = {
      professional: 'Tone: Professional and courteous.',
      friendly: 'Tone: Friendly, warm, and conversational.',
      apologetic: 'Tone: Sincerely apologetic and empathetic, showing genuine concern.',
    };
    const toneInstruction = toneMap[tone || 'professional'] ?? toneMap.professional;

    const lengthMap: Record<string, string> = {
      shorter: 'Length: Keep it to 2-3 sentences, very concise.',
      longer: 'Length: Write 5-7 sentences with more detail.',
    };
    const lengthInstruction = (length ? lengthMap[length] : null) ?? 'Length: 3-5 sentences.';

    const systemPrompt = `You are a review reply expert for small businesses. Write a professional, heartfelt response to the following review.

Rules:
- For 1-2 star reviews: Sincerely apologize, acknowledge specific issues, promise improvement, and offer to discuss further.
- For 3 star reviews: Thank them, acknowledge room for improvement, invite them back.
- For 4-5 star reviews: Express genuine gratitude, mention specific positive points from the review, express hope to see them again.
- Do NOT use emojis.
- Write in English.
- ${toneInstruction}
- ${lengthInstruction}
- Output ONLY the reply text, no quotes, no labels, no explanations.`;

    const userPrompt = `Business: ${businessName || 'Our Business'}
Reviewer: ${reviewerName}
Rating: ${reviewRating}/5
Review: ${reviewContent}`;

    const ai = getAIClient();
    const response = await ai.messages.create({
      model: AI_MODEL,
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const reply = response.content[0].type === 'text' ? response.content[0].text : '';

    // Increment usage
    const month = getCurrentMonth();
    await prisma.aiUsage.upsert({
      where: {
        userId_type_month: {
          userId: session.user.id,
          type: 'suggest_reply',
          month,
        },
      },
      update: { count: { increment: 1 } },
      create: {
        userId: session.user.id,
        type: 'suggest_reply',
        month,
        count: 1,
      },
    });

    return successResponse({
      reply,
      usage: { used: limitCheck.used + 1, limit: limitCheck.limit },
    });
  } catch (error) {
    console.error('AI suggest-reply error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to generate AI reply',
      500
    );
  }
}
