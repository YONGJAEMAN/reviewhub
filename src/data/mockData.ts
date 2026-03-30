import type {
  Review,
  KpiData,
  ChartDataPoint,
  PlatformPerformanceData,
  PlatformConnection,
  NotificationSetting,
  KeywordData,
  AnalyticsPlatform,
  SentimentTrendPoint,
  RatingDistItem,
  PlatformComparisonData,
  TopKeyword,
  ReviewerHistory,
} from '@/types';

export const reviews: Review[] = [
  {
    id: '1',
    platform: 'google',
    authorName: 'Sarah Mitchell',
    authorAvatar: 'https://i.pravatar.cc/48?img=1',
    authorInitials: 'SM',
    isVerified: true,
    localGuide: true,
    reviewCount: 12,
    rating: 5,
    title: 'Absolutely Outstanding Experience',
    content:
      'From the moment we walked in, the atmosphere was incredible. The staff went above and beyond to make our experience memorable. The attention to detail in every aspect of the service was remarkable. Would highly recommend to anyone looking for quality.',
    tags: ['CUSTOMER SERVICE', 'QUALITY'],
    status: 'action_required',
    postedAt: '2 hours ago',
  },
  {
    id: '2',
    platform: 'yelp',
    authorName: 'Marcus Chen',
    authorInitials: 'MC',
    isVerified: false,
    reviewCount: 3,
    rating: 1,
    title: 'Terrible Experience - Never Again',
    content:
      'Waited 45 minutes for our order despite the restaurant being half empty. When the food finally arrived, it was cold and clearly not fresh. The manager was dismissive when we raised concerns. Completely unacceptable for the prices they charge.',
    tags: ['OPERATIONS'],
    status: 'high_priority',
    postedAt: '5 hours ago',
  },
  {
    id: '3',
    platform: 'facebook',
    authorName: 'Emily Rodriguez',
    authorAvatar: 'https://i.pravatar.cc/48?img=5',
    authorInitials: 'ER',
    isVerified: true,
    reviewCount: 8,
    rating: 4,
    title: 'Great Selection, Minor Issues',
    content:
      'Love the variety of products available. The handmade items are truly unique and well-crafted. Only giving 4 stars because the checkout process was a bit slow during peak hours.',
    tags: ['PRODUCT QUALITY', 'CHECKOUT'],
    status: 'replied',
    postedAt: '1 day ago',
    reply: {
      content:
        'Thank you so much for your kind words, Emily! We appreciate your feedback about the checkout process and are actively working on improving our peak-hour efficiency. We hope to see you again soon!',
      repliedAt: '12h ago',
    },
  },
  {
    id: '4',
    platform: 'whatsapp',
    authorName: 'James O\'Brien',
    authorAvatar: 'https://i.pravatar.cc/48?img=8',
    authorInitials: 'JO',
    isVerified: false,
    rating: 5,
    content:
      'Quick delivery and excellent packaging. The product quality exceeded my expectations. Will definitely be ordering again. Customer support was responsive and helpful throughout.',
    tags: ['DELIVERY', 'SUPPORT'],
    status: 'action_required',
    postedAt: '2 days ago',
  },
  {
    id: '5',
    platform: 'google',
    authorName: 'Lisa Park',
    authorInitials: 'LP',
    isVerified: true,
    localGuide: true,
    reviewCount: 24,
    rating: 3,
    title: 'Average Experience',
    content:
      'The products are decent but nothing extraordinary. Pricing feels a bit high for what you get. Staff was friendly though, and the store layout is pleasant.',
    tags: ['PRICING', 'AMBIANCE'],
    status: 'action_required',
    postedAt: '3 days ago',
  },
  {
    id: '6',
    platform: 'yelp',
    authorName: 'David Kim',
    authorAvatar: 'https://i.pravatar.cc/48?img=12',
    authorInitials: 'DK',
    isVerified: false,
    reviewCount: 6,
    rating: 2,
    title: 'Disappointing Visit',
    content:
      'Had high expectations based on online reviews but was let down. The items on display didn\'t match the online catalog. Return policy was confusing and unhelpful.',
    tags: ['OPERATIONS', 'RETURNS'],
    status: 'high_priority',
    postedAt: '4 days ago',
  },
];

export const kpiData: KpiData[] = [
  {
    label: 'OVERALL RATING',
    value: '4.5',
    change: '+0.2%',
    positive: true,
    icon: 'star',
  },
  {
    label: 'TOTAL REVIEWS',
    value: '1,240',
    change: '+12 new',
    positive: true,
    icon: 'trending-up',
  },
  {
    label: 'POSITIVE SENTIMENT',
    value: '82%',
    change: '+4%',
    positive: true,
    icon: 'smile',
  },
  {
    label: 'NET PROMOTER SCORE',
    value: '+45',
    change: '+45',
    positive: true,
    icon: 'bar-chart',
  },
];

export const kpiByPeriod: Record<string, KpiData[]> = {
  '7': [
    { label: 'OVERALL RATING', value: '4.6', change: '+0.3%', positive: true, icon: 'star' },
    { label: 'TOTAL REVIEWS', value: '89', change: '+8 new', positive: true, icon: 'trending-up' },
    { label: 'POSITIVE SENTIMENT', value: '85%', change: '+6%', positive: true, icon: 'smile' },
    { label: 'NET PROMOTER SCORE', value: '+52', change: '+52', positive: true, icon: 'bar-chart' },
  ],
  '30': [
    { label: 'OVERALL RATING', value: '4.5', change: '+0.2%', positive: true, icon: 'star' },
    { label: 'TOTAL REVIEWS', value: '1,240', change: '+12 new', positive: true, icon: 'trending-up' },
    { label: 'POSITIVE SENTIMENT', value: '82%', change: '+4%', positive: true, icon: 'smile' },
    { label: 'NET PROMOTER SCORE', value: '+45', change: '+45', positive: true, icon: 'bar-chart' },
  ],
  '90': [
    { label: 'OVERALL RATING', value: '4.4', change: '+0.1%', positive: true, icon: 'star' },
    { label: 'TOTAL REVIEWS', value: '3,820', change: '+340 new', positive: true, icon: 'trending-up' },
    { label: 'POSITIVE SENTIMENT', value: '79%', change: '+2%', positive: true, icon: 'smile' },
    { label: 'NET PROMOTER SCORE', value: '+38', change: '+38', positive: true, icon: 'bar-chart' },
  ],
  '365': [
    { label: 'OVERALL RATING', value: '4.3', change: '+0.1%', positive: true, icon: 'star' },
    { label: 'TOTAL REVIEWS', value: '12,450', change: '+1.2k new', positive: true, icon: 'trending-up' },
    { label: 'POSITIVE SENTIMENT', value: '78%', change: '+1%', positive: true, icon: 'smile' },
    { label: 'NET PROMOTER SCORE', value: '+34', change: '+34', positive: true, icon: 'bar-chart' },
  ],
};

export const chartData: ChartDataPoint[] = [
  { week: 'OCT 01', thisMonth: 42, lastMonth: 35 },
  { week: 'OCT 08', thisMonth: 55, lastMonth: 40 },
  { week: 'OCT 15', thisMonth: 48, lastMonth: 38 },
  { week: 'OCT 22', thisMonth: 60, lastMonth: 42 },
  { week: 'OCT 30', thisMonth: 52, lastMonth: 36 },
];

export const chartByPeriod: Record<string, ChartDataPoint[]> = {
  '7': [
    { week: 'MON', thisMonth: 12, lastMonth: 10 },
    { week: 'TUE', thisMonth: 15, lastMonth: 11 },
    { week: 'WED', thisMonth: 18, lastMonth: 14 },
    { week: 'THU', thisMonth: 14, lastMonth: 12 },
    { week: 'FRI', thisMonth: 16, lastMonth: 9 },
    { week: 'SAT', thisMonth: 8, lastMonth: 7 },
    { week: 'SUN', thisMonth: 6, lastMonth: 5 },
  ],
  '30': [
    { week: 'OCT 01', thisMonth: 42, lastMonth: 35 },
    { week: 'OCT 08', thisMonth: 55, lastMonth: 40 },
    { week: 'OCT 15', thisMonth: 48, lastMonth: 38 },
    { week: 'OCT 22', thisMonth: 60, lastMonth: 42 },
    { week: 'OCT 30', thisMonth: 52, lastMonth: 36 },
  ],
  '90': [
    { week: 'AUG', thisMonth: 320, lastMonth: 280 },
    { week: 'SEP', thisMonth: 380, lastMonth: 310 },
    { week: 'OCT', thisMonth: 420, lastMonth: 350 },
  ],
  '365': [
    { week: 'Q1', thisMonth: 2800, lastMonth: 2400 },
    { week: 'Q2', thisMonth: 3200, lastMonth: 2700 },
    { week: 'Q3', thisMonth: 3100, lastMonth: 2900 },
    { week: 'Q4', thisMonth: 3350, lastMonth: 3000 },
  ],
};

export const platformPerformance: PlatformPerformanceData[] = [
  { platform: 'google', rating: 4.8, reviews: 8910, color: '#4285F4' },
  { platform: 'yelp', rating: 3.9, reviews: 210, color: '#D32323' },
  { platform: 'facebook', rating: 4.3, reviews: 866, color: '#1877F2' },
  { platform: 'whatsapp', rating: 4.2, reviews: 126, color: '#25D366' },
];

export const platformConnections: PlatformConnection[] = [
  {
    platform: 'google',
    name: 'Google Business',
    connected: true,
    detail: 'Last synced 2 hours ago',
  },
  {
    platform: 'yelp',
    name: 'Yelp',
    connected: true,
    detail: '32 new reviews pending',
  },
  {
    platform: 'facebook',
    name: 'Facebook Page',
    connected: false,
    detail: 'Authorization expired',
  },
  {
    platform: 'whatsapp',
    name: 'WhatsApp',
    connected: true,
    detail: 'Automated replies active',
  },
];

export const notificationSettings: NotificationSetting[] = [
  {
    id: 'review-alerts',
    title: 'Review Alerts',
    description: 'Instant push notification for new reviews',
    enabled: true,
  },
  {
    id: 'weekly-summary',
    title: 'Weekly Summary',
    description: 'Email report of sentiment trends',
    enabled: true,
  },
  {
    id: 'negative-flag',
    title: 'Negative Sentiment Flag',
    description: 'Urgent alerts for ≤3 star reviews',
    enabled: true,
  },
];

export const sentimentData = {
  positive: 1240,
  neutral: 215,
  negative: 94,
  percentage: 78,
};

export const analyticsPlatforms: AnalyticsPlatform[] = [
  { platform: 'google', rating: 4.8, reviewVolume: 850, maxVolume: 850, color: '#4285F4' },
  { platform: 'yelp', rating: 4.2, reviewVolume: 620, maxVolume: 850, color: '#D32323' },
  { platform: 'facebook', rating: 4.5, reviewVolume: 580, maxVolume: 850, color: '#1877F2' },
  { platform: 'whatsapp', rating: 4.9, reviewVolume: 420, maxVolume: 850, color: '#25D366' },
];

export const keywordCloud: KeywordData[] = [
  { word: 'Friendly', size: 28, sentiment: 'positive' },
  { word: 'Fast Shipping', size: 16, sentiment: 'positive' },
  { word: 'Great Quality', size: 22, sentiment: 'positive' },
  { word: 'Reliable', size: 14, sentiment: 'neutral' },
  { word: 'Responsive', size: 26, sentiment: 'positive' },
  { word: 'Authentic', size: 18, sentiment: 'positive' },
  { word: 'Pricey', size: 14, sentiment: 'negative' },
  { word: 'Wait Time', size: 16, sentiment: 'negative' },
  { word: 'Packaging', size: 14, sentiment: 'neutral' },
  { word: 'Knowledgeable', size: 22, sentiment: 'positive' },
  { word: 'Excellent', size: 16, sentiment: 'positive' },
];

export const sentimentTrend: SentimentTrendPoint[] = [
  { month: 'May', positive: 75, negative: 25 },
  { month: 'Jun', positive: 78, negative: 22 },
  { month: 'Jul', positive: 82, negative: 18 },
  { month: 'Aug', positive: 80, negative: 20 },
  { month: 'Sep', positive: 85, negative: 15 },
  { month: 'Oct', positive: 88, negative: 12 },
];

export const ratingDistribution: RatingDistItem[] = [
  { stars: 5, percentage: 45, count: 558 },
  { stars: 4, percentage: 28, count: 347 },
  { stars: 3, percentage: 15, count: 186 },
  { stars: 2, percentage: 7, count: 87 },
  { stars: 1, percentage: 5, count: 62 },
];

export const platformComparison: PlatformComparisonData[] = [
  { platform: 'google', name: 'Google', rating: 4.8, totalReviews: 8910, responseRate: 92, avgResponseTime: '2.1h', color: '#4285F4' },
  { platform: 'yelp', name: 'Yelp', rating: 3.9, totalReviews: 210, responseRate: 67, avgResponseTime: '8.4h', color: '#D32323' },
  { platform: 'facebook', name: 'Facebook', rating: 4.3, totalReviews: 866, responseRate: 85, avgResponseTime: '3.2h', color: '#1877F2' },
  { platform: 'whatsapp', name: 'WhatsApp', rating: 4.2, totalReviews: 126, responseRate: 95, avgResponseTime: '1.5h', color: '#25D366' },
];

export const topKeywords: TopKeyword[] = [
  { keyword: 'customer service', count: 42 },
  { keyword: 'food quality', count: 38 },
  { keyword: 'wait time', count: 31 },
  { keyword: 'atmosphere', count: 28 },
  { keyword: 'friendly staff', count: 25 },
  { keyword: 'clean', count: 22 },
  { keyword: 'price', count: 19 },
  { keyword: 'location', count: 17 },
  { keyword: 'parking', count: 15 },
  { keyword: 'delivery', count: 12 },
];

export const reviewerHistories: Record<string, ReviewerHistory[]> = {
  '1': [
    { id: 'h1', rating: 4, title: 'Great products, slightly pricey', date: '2 months ago' },
    { id: 'h2', rating: 5, title: 'Perfect gift shopping destination', date: '5 months ago' },
  ],
  '2': [
    { id: 'h3', rating: 2, title: 'Slow service on weekends', date: '3 months ago' },
    { id: 'h4', rating: 3, title: 'Decent but not worth the hype', date: '6 months ago' },
  ],
  '3': [
    { id: 'h5', rating: 5, title: 'Always a pleasure visiting', date: '1 month ago' },
    { id: 'h6', rating: 4, title: 'Lovely handmade collection', date: '4 months ago' },
    { id: 'h7', rating: 5, title: 'Best artisan shop in town', date: '8 months ago' },
  ],
  '4': [
    { id: 'h8', rating: 4, title: 'Reliable online ordering', date: '3 months ago' },
  ],
  '5': [
    { id: 'h9', rating: 4, title: 'Nice selection of local goods', date: '2 months ago' },
    { id: 'h10', rating: 3, title: 'Could improve pricing', date: '7 months ago' },
  ],
  '6': [
    { id: 'h11', rating: 3, title: 'Mixed feelings about the experience', date: '1 month ago' },
    { id: 'h12', rating: 1, title: 'Worst return policy ever', date: '5 months ago' },
  ],
};
