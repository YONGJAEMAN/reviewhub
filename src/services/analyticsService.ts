import {
  sentimentTrend,
  ratingDistribution,
  platformComparison,
  topKeywords,
} from '@/data/mockData';
import type {
  SentimentTrendPoint,
  RatingDistItem,
  PlatformComparisonData,
  TopKeyword,
} from '@/types';

export async function getSentimentTrend(): Promise<SentimentTrendPoint[]> {
  // TODO: Replace with aggregated DB queries (sentiment by month)
  return sentimentTrend;
}

export async function getRatingDistribution(): Promise<RatingDistItem[]> {
  // TODO: Replace with grouped count query by rating
  return ratingDistribution;
}

export async function getPlatformComparison(): Promise<PlatformComparisonData[]> {
  // TODO: Replace with aggregated DB queries per platform
  return platformComparison;
}

export async function getTopKeywords(): Promise<TopKeyword[]> {
  // TODO: Replace with text analysis / keyword extraction
  return topKeywords;
}
