/**
 * @jest-environment node
 */
import { analyzeSentiment, determineStatusFromSentiment } from '../sentimentService';

const mockCreate = jest.fn();

jest.mock('@/lib/ai', () => ({
  getAIClient: () => ({
    messages: { create: mockCreate },
  }),
  AI_MODEL: 'test-model',
}));

beforeEach(() => jest.clearAllMocks());

describe('analyzeSentiment', () => {
  it('parses valid AI response', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify({
        score: 0.85,
        label: 'positive',
        keywords: ['service', 'friendly'],
        urgency: 'low',
      }) }],
    });

    const result = await analyzeSentiment('Great service!');
    expect(result.score).toBe(0.85);
    expect(result.label).toBe('positive');
    expect(result.keywords).toEqual(['service', 'friendly']);
    expect(result.urgency).toBe('low');
  });

  it('clamps score to 0-1 range', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify({
        score: 1.5, label: 'positive', keywords: [], urgency: 'low',
      }) }],
    });

    const result = await analyzeSentiment('Amazing!');
    expect(result.score).toBe(1);
  });

  it('defaults invalid label to neutral', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify({
        score: 0.5, label: 'invalid', keywords: [], urgency: 'medium',
      }) }],
    });

    const result = await analyzeSentiment('Okay.');
    expect(result.label).toBe('neutral');
  });

  it('defaults invalid urgency to medium', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify({
        score: 0.5, label: 'neutral', keywords: [], urgency: 'unknown',
      }) }],
    });

    const result = await analyzeSentiment('Alright.');
    expect(result.urgency).toBe('medium');
  });

  it('limits keywords to 5', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify({
        score: 0.7, label: 'positive', keywords: ['a', 'b', 'c', 'd', 'e', 'f', 'g'], urgency: 'low',
      }) }],
    });

    const result = await analyzeSentiment('Many keywords');
    expect(result.keywords).toHaveLength(5);
  });

  it('falls back to rating-based sentiment on API error', async () => {
    mockCreate.mockRejectedValue(new Error('API down'));

    const result = await analyzeSentiment('Bad experience', 1);
    expect(result.label).toBe('negative');
    expect(result.score).toBe(0.2);
    expect(result.urgency).toBe('high');
  });

  it('falls back to positive for high rating', async () => {
    mockCreate.mockRejectedValue(new Error('API down'));

    const result = await analyzeSentiment('Great!', 5);
    expect(result.label).toBe('positive');
    expect(result.score).toBe(0.8);
  });

  it('falls back to neutral for mid rating', async () => {
    mockCreate.mockRejectedValue(new Error('API down'));

    const result = await analyzeSentiment('Okay', 3);
    expect(result.label).toBe('neutral');
    expect(result.score).toBe(0.5);
  });
});

describe('determineStatusFromSentiment', () => {
  it('returns REPLIED when hasReply is true', () => {
    expect(determineStatusFromSentiment(1, 'high', true)).toBe('REPLIED');
  });

  it('returns HIGH_PRIORITY for high urgency + low rating', () => {
    expect(determineStatusFromSentiment(2, 'high', false)).toBe('HIGH_PRIORITY');
    expect(determineStatusFromSentiment(1, 'high', false)).toBe('HIGH_PRIORITY');
  });

  it('returns ACTION_REQUIRED for other combinations', () => {
    expect(determineStatusFromSentiment(3, 'high', false)).toBe('ACTION_REQUIRED');
    expect(determineStatusFromSentiment(2, 'medium', false)).toBe('ACTION_REQUIRED');
    expect(determineStatusFromSentiment(5, 'low', false)).toBe('ACTION_REQUIRED');
  });
});
