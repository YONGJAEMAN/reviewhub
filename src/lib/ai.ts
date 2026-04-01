import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

export function getAIClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

export const AI_MODEL = 'claude-haiku-4-5-20251001';
export const AI_REPLY_MONTHLY_LIMIT = 50;
