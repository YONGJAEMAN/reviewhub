import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config({ path: '.env.local' });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const FIXED_IDS = {
  user: 'seed-user-james-001',
  business: 'seed-biz-artisan-001',
  platforms: {
    google: 'seed-plat-google-001',
    yelp: 'seed-plat-yelp-001',
    facebook: 'seed-plat-facebook-001',
    whatsapp: 'seed-plat-whatsapp-001',
  },
  reviews: [
    'seed-review-001',
    'seed-review-002',
    'seed-review-003',
    'seed-review-004',
    'seed-review-005',
    'seed-review-006',
  ],
  settings: 'seed-settings-001',
} as const;

async function main() {
  console.log('Seeding database...');

  // 1. User
  const hashedPassword = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'james@artisan.com' },
    update: { name: 'James Miller', password: hashedPassword },
    create: {
      id: FIXED_IDS.user,
      name: 'James Miller',
      email: 'james@artisan.com',
      password: hashedPassword,
    },
  });
  console.log(`User: ${user.name} (${user.id})`);

  // 2. Business
  const business = await prisma.business.upsert({
    where: { id: FIXED_IDS.business },
    update: {
      name: 'The Artisan Collective',
      email: 'hello@artisancollective.com',
      description: 'Curating the finest local handmade goods for the modern home.\nEstablished 2018.',
    },
    create: {
      id: FIXED_IDS.business,
      name: 'The Artisan Collective',
      email: 'hello@artisancollective.com',
      description: 'Curating the finest local handmade goods for the modern home.\nEstablished 2018.',
      ownerId: user.id,
    },
  });
  console.log(`Business: ${business.name}`);

  // 3. Platforms
  const platformData = [
    { id: FIXED_IDS.platforms.google, type: 'GOOGLE' as const, name: 'Google Business', status: 'CONNECTED' as const, detail: 'Last synced 2 hours ago' },
    { id: FIXED_IDS.platforms.yelp, type: 'YELP' as const, name: 'Yelp', status: 'CONNECTED' as const, detail: '32 new reviews pending' },
    { id: FIXED_IDS.platforms.facebook, type: 'FACEBOOK' as const, name: 'Facebook Page', status: 'CONNECTED' as const, detail: 'Synced 1 day ago' },
    { id: FIXED_IDS.platforms.whatsapp, type: 'WHATSAPP' as const, name: 'WhatsApp', status: 'DISCONNECTED' as const, detail: 'Not connected' },
  ];

  for (const p of platformData) {
    await prisma.platform.upsert({
      where: { id: p.id },
      update: { name: p.name, status: p.status, detail: p.detail },
      create: { ...p, businessId: business.id },
    });
  }
  console.log(`Platforms: ${platformData.length} created`);

  // 4. Reviews
  const now = new Date();
  const reviewData = [
    {
      id: FIXED_IDS.reviews[0],
      platform: 'GOOGLE' as const,
      authorName: 'Sarah Mitchell',
      authorAvatar: 'https://i.pravatar.cc/48?img=1',
      authorInitials: 'SM',
      isVerified: true,
      localGuide: true,
      reviewCount: 12,
      rating: 5,
      title: 'Absolutely Outstanding Experience',
      content: 'From the moment we walked in, the atmosphere was incredible. The staff went above and beyond to make our experience memorable. The attention to detail in every aspect of the service was remarkable. Would highly recommend to anyone looking for quality.',
      tags: ['CUSTOMER SERVICE', 'QUALITY'],
      status: 'ACTION_REQUIRED' as const,
      postedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      platformId: FIXED_IDS.platforms.google,
    },
    {
      id: FIXED_IDS.reviews[1],
      platform: 'YELP' as const,
      authorName: 'Marcus Chen',
      authorInitials: 'MC',
      isVerified: false,
      reviewCount: 3,
      rating: 1,
      title: 'Terrible Experience - Never Again',
      content: 'Waited 45 minutes for our order despite the restaurant being half empty. When the food finally arrived, it was cold and clearly not fresh. The manager was dismissive when we raised concerns. Completely unacceptable for the prices they charge.',
      tags: ['OPERATIONS'],
      status: 'HIGH_PRIORITY' as const,
      postedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
      platformId: FIXED_IDS.platforms.yelp,
    },
    {
      id: FIXED_IDS.reviews[2],
      platform: 'FACEBOOK' as const,
      authorName: 'Emily Rodriguez',
      authorAvatar: 'https://i.pravatar.cc/48?img=5',
      authorInitials: 'ER',
      isVerified: true,
      reviewCount: 8,
      rating: 4,
      title: 'Great Selection, Minor Issues',
      content: 'Love the variety of products available. The handmade items are truly unique and well-crafted. Only giving 4 stars because the checkout process was a bit slow during peak hours.',
      tags: ['PRODUCT QUALITY', 'CHECKOUT'],
      status: 'REPLIED' as const,
      postedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
      platformId: FIXED_IDS.platforms.facebook,
    },
    {
      id: FIXED_IDS.reviews[3],
      platform: 'WHATSAPP' as const,
      authorName: "James O'Brien",
      authorAvatar: 'https://i.pravatar.cc/48?img=8',
      authorInitials: 'JO',
      isVerified: false,
      rating: 5,
      content: 'Quick delivery and excellent packaging. The product quality exceeded my expectations. Will definitely be ordering again. Customer support was responsive and helpful throughout.',
      tags: ['DELIVERY', 'SUPPORT'],
      status: 'ACTION_REQUIRED' as const,
      postedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      platformId: FIXED_IDS.platforms.whatsapp,
    },
    {
      id: FIXED_IDS.reviews[4],
      platform: 'GOOGLE' as const,
      authorName: 'Lisa Park',
      authorInitials: 'LP',
      isVerified: true,
      localGuide: true,
      reviewCount: 24,
      rating: 3,
      title: 'Average Experience',
      content: 'The products are decent but nothing extraordinary. Pricing feels a bit high for what you get. Staff was friendly though, and the store layout is pleasant.',
      tags: ['PRICING', 'AMBIANCE'],
      status: 'ACTION_REQUIRED' as const,
      postedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      platformId: FIXED_IDS.platforms.google,
    },
    {
      id: FIXED_IDS.reviews[5],
      platform: 'YELP' as const,
      authorName: 'David Kim',
      authorAvatar: 'https://i.pravatar.cc/48?img=12',
      authorInitials: 'DK',
      isVerified: false,
      reviewCount: 6,
      rating: 2,
      title: 'Disappointing Visit',
      content: "Had high expectations based on online reviews but was let down. The items on display didn't match the online catalog. Return policy was confusing and unhelpful.",
      tags: ['OPERATIONS', 'RETURNS'],
      status: 'HIGH_PRIORITY' as const,
      postedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      platformId: FIXED_IDS.platforms.yelp,
    },
  ];

  for (const r of reviewData) {
    await prisma.review.upsert({
      where: { id: r.id },
      update: {
        authorName: r.authorName,
        authorAvatar: r.authorAvatar,
        authorInitials: r.authorInitials,
        isVerified: r.isVerified,
        localGuide: r.localGuide,
        reviewCount: r.reviewCount,
        rating: r.rating,
        title: r.title,
        content: r.content,
        tags: r.tags,
        status: r.status,
        postedAt: r.postedAt,
      },
      create: { ...r, businessId: business.id },
    });
  }
  console.log(`Reviews: ${reviewData.length} created`);

  // 5. Replies (for review 3 - Emily Rodriguez, already REPLIED)
  await prisma.reply.upsert({
    where: { reviewId: FIXED_IDS.reviews[2] },
    update: {
      content: 'Thank you so much for your kind words, Emily! We appreciate your feedback about the checkout process and are actively working on improving our peak-hour efficiency. We hope to see you again soon!',
    },
    create: {
      content: 'Thank you so much for your kind words, Emily! We appreciate your feedback about the checkout process and are actively working on improving our peak-hour efficiency. We hope to see you again soon!',
      reviewId: FIXED_IDS.reviews[2],
      repliedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
    },
  });
  console.log('Replies: 1 created');

  // 6. Settings
  await prisma.settings.upsert({
    where: { businessId: business.id },
    update: {
      reviewAlerts: true,
      weeklySummary: true,
      negativeSentiment: true,
    },
    create: {
      id: FIXED_IDS.settings,
      reviewAlerts: true,
      weeklySummary: true,
      negativeSentiment: true,
      businessId: business.id,
    },
  });
  console.log('Settings: created');

  console.log('\nSeed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
