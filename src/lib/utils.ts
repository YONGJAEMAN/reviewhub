import type { Platform } from '@/types';

export function platformLabel(platform: Platform): string {
  const labels: Record<Platform, string> = {
    google: 'Google Maps',
    yelp: 'Yelp',
    facebook: 'Facebook',
    whatsapp: 'WhatsApp',
  };
  return labels[platform];
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

export function renderStars(rating: number): string {
  return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
}

export function ratingLabel(rating: number): string {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 3.5) return 'Good';
  if (rating >= 2.5) return 'Average';
  if (rating >= 1.5) return 'Poor';
  return 'Terrible';
}
