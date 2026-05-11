'use client';

import { useEffect } from 'react';

/**
 * Registers /sw.js on first mount in production. No-op during dev so HMR
 * isn't intercepted.
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      } catch {
        // Registration failures are non-critical — app still works online.
      }
    };
    // Wait for window load so we don't compete with the initial render.
    if (document.readyState === 'complete') {
      void register();
    } else {
      window.addEventListener('load', register, { once: true });
    }
  }, []);
  return null;
}
