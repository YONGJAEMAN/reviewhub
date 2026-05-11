// ReviewHub service worker
// Strategy:
//   - Pre-cache the offline fallback page on install
//   - Network-first for navigations; fall back to offline page when offline
//   - Cache-first for icons + manifest (rarely change)
//   - Pass-through everything else (esp. API + auth)
//
// Bump CACHE_VERSION whenever this file changes so old clients pick it up.

const CACHE_VERSION = 'v1';
const CACHE_NAME = `reviewhub-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline';
const PRECACHE = [OFFLINE_URL, '/icons/icon-192.png', '/icons/icon-512.png', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Drop stale caches.
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GETs — anything else (POST/PUT/PATCH/DELETE) flows through.
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Never cache the auth API, API routes, or the Next dev HMR endpoints.
  // These must always hit the network.
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/data/') ||
    url.pathname.startsWith('/_next/webpack-hmr')
  ) {
    return;
  }

  // Cache-first for static assets we precache.
  if (PRECACHE.some((path) => url.pathname === path)) {
    event.respondWith(
      caches.match(req).then((cached) => cached ?? fetch(req)),
    );
    return;
  }

  // Network-first for HTML navigations, with offline page fallback.
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          return fresh;
        } catch {
          const cache = await caches.open(CACHE_NAME);
          const offline = await cache.match(OFFLINE_URL);
          return offline ?? new Response('Offline', { status: 503 });
        }
      })(),
    );
  }
});
