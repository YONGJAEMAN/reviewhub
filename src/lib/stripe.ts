import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return _stripe;
}

export interface PlanConfig {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
}

export const PLANS: Record<string, PlanConfig> = {
  STARTER: {
    name: 'Starter',
    monthlyPrice: 1900,
    yearlyPrice: 18200,
    features: [
      '1 Business Location',
      '10 AI Replies / month',
      '100 WhatsApp Requests / month',
      'Google & Yelp Integration',
      'Basic Analytics',
    ],
  },
  GROWTH: {
    name: 'Growth',
    monthlyPrice: 3900,
    yearlyPrice: 37400,
    features: [
      '3 Business Locations',
      '50 AI Replies / month',
      '500 WhatsApp Requests / month',
      'All Platform Integrations',
      'Advanced Analytics',
      'Sentiment Analysis',
      '3 Competitor Tracking',
    ],
  },
  PRO: {
    name: 'Pro',
    monthlyPrice: 6900,
    yearlyPrice: 66200,
    features: [
      '10 Business Locations',
      'Unlimited AI Replies',
      'Unlimited WhatsApp Requests',
      'All Platform Integrations',
      'Advanced Analytics & Reports',
      'Sentiment Analysis',
      '10 Competitor Tracking',
      'Priority Support',
    ],
  },
};

export const PLAN_LIMITS: Record<string, { aiReplies: number; whatsapp: number; businesses: number; competitors: number }> = {
  FREE:    { aiReplies: 3,  whatsapp: 10,   businesses: 1, competitors: 0 },
  STARTER: { aiReplies: 10, whatsapp: 100,  businesses: 1, competitors: 0 },
  GROWTH:  { aiReplies: 50, whatsapp: 500,  businesses: 3, competitors: 3 },
  PRO:     { aiReplies: -1, whatsapp: -1,   businesses: 10, competitors: 10 },
};

export function getPlanFromPriceAmount(amount: number): string {
  for (const [plan, config] of Object.entries(PLANS)) {
    if (config.monthlyPrice === amount || config.yearlyPrice === amount) {
      return plan;
    }
  }
  return 'STARTER';
}
