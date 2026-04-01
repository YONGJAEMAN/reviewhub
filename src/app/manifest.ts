import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ReviewHub - Review Management',
    short_name: 'ReviewHub',
    description: 'Manage all your business reviews in one dashboard.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#F8F9FB',
    theme_color: '#0F1B2D',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
