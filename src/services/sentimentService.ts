import { getAIClient, AI_MODEL } from '@/lib/ai';

export interface SentimentResult {
  score: number;
  label: 'positive' | 'neutral' | 'negative';
  keywords: string[];
  urgency: 'high' | 'medium' | 'low';
}

function fallbackSentiment(rating: number): SentimentResult {
  if (rating >= 4) {
    return { score: 0.8, label: 'positive', keywords: [], urgency: 'low' };
  }
  if (rating <= 2) {
    return { score: 0.2, label: 'negative', keywords: [], urgency: 'high' };
  }
  return { score: 0.5, label: 'neutral', keywords: [], urgency: 'medium' };
}

export async function analyzeSentiment(
  reviewContent: string,
  rating?: number
): Promise<SentimentResult> {
  try {
    const ai = getAIClient();

    const response = await ai.messages.create({
      model: AI_MODEL,
      max_tokens: 300,
      system: `You are a sentiment analysis engine. Analyze the given review and respond ONLY with a valid JSON object. No other text.

Response format:
{
  "score": 0.85,
  "label": "positive",
  "keywords": ["customer service", "friendly staff"],
  "urgency": "low"
}

Rules:
- score: 0.0 (very negative) to 1.0 (very positive)
- label: "positive" (score >= 0.6), "neutral" (0.4-0.6), "negative" (score < 0.4)
- keywords: 3-5 key topics from the review in English
- urgency: "high" (needs immediate response), "medium" (respond today), "low" (routine)`,
      messages: [{ role: 'user', content: `Review: ${reviewContent}` }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = JSON.parse(text);

    return {
      score: Math.max(0, Math.min(1, Number(parsed.score) || 0.5)),
      label: ['positive', 'neutral', 'negative'].includes(parsed.label) ? parsed.label : 'neutral',
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 5) : [],
      urgency: ['high', 'medium', 'low'].includes(parsed.urgency) ? parsed.urgency : 'medium',
    };
  } catch (error) {
    console.error('Sentiment analysis failed, using fallback:', error);
    return fallbackSentiment(rating ?? 3);
  }
}

export function determineStatusFromSentiment(
  rating: number,
  urgency: string,
  hasReply: boolean
): 'ACTION_REQUIRED' | 'HIGH_PRIORITY' | 'REPLIED' {
  if (hasReply) return 'REPLIED';
  if (urgency === 'high' && rating <= 2) return 'HIGH_PRIORITY';
  return 'ACTION_REQUIRED';
}
