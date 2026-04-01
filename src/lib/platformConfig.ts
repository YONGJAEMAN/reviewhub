import type { Platform } from '@/types';

export interface PlatformInfo {
  letter: string;
  color: string;
  label: string;
}

export const platformConfig: Record<Platform, PlatformInfo> = {
  google: { letter: 'G', color: '#4285F4', label: 'Google Maps' },
  yelp: { letter: 'Y', color: '#D32323', label: 'Yelp' },
  facebook: { letter: 'f', color: '#1877F2', label: 'Facebook' },
  whatsapp: { letter: 'W', color: '#25D366', label: 'WhatsApp' },
};
