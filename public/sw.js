// Development stub — Serwist will overwrite this on production build (npm run build)
// Prevents bad-precaching-response errors caused by stale precache manifests in dev

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))
