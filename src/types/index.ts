export type Platform = 'google' | 'yelp' | 'facebook' | 'whatsapp';

export type ReviewStatus = 'action_required' | 'high_priority' | 'replied';

export interface Review {
  id: string;
  platform: Platform;
  authorName: string;
  authorAvatar?: string;
  authorInitials: string;
  isVerified: boolean;
  localGuide?: boolean;
  reviewCount?: number;
  rating: number;
  title?: string;
  content: string;
  tags: string[];
  status: ReviewStatus;
  postedAt: string;
  reply?: {
    content: string;
    repliedAt: string;
  };
}

export interface KpiData {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
}

export interface ChartDataPoint {
  week: string;
  thisMonth: number;
  lastMonth: number;
}

export interface PlatformPerformanceData {
  platform: Platform;
  rating: number;
  reviews: number;
  color: string;
}

export interface PlatformConnection {
  id: string;
  platform: Platform;
  name: string;
  connected: boolean;
  detail: string;
  lastSynced?: string;
}

export interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export interface KeywordData {
  word: string;
  size: number;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface AnalyticsPlatform {
  platform: Platform;
  rating: number;
  reviewVolume: number;
  maxVolume: number;
  color: string;
}

export interface SentimentTrendPoint {
  month: string;
  positive: number;
  negative: number;
}

export interface RatingDistItem {
  stars: number;
  percentage: number;
  count: number;
}

export interface PlatformComparisonData {
  platform: Platform;
  name: string;
  rating: number;
  totalReviews: number;
  responseRate: number;
  avgResponseTime: string;
  color: string;
}

export interface TopKeyword {
  keyword: string;
  count: number;
}

export interface ReviewerHistory {
  id: string;
  rating: number;
  title: string;
  date: string;
}
