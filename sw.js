/**
 * SRI NEYA CRANE SERVICES (SNC) - Service Worker
 * Provides offline caching for static assets and resilient performance
 */

const CACHE_NAME = 'snc-crane-v1.0.0';
const CORE_ASSETS = [
  './',
  './index.html',
  './about.html',
  './fleet.html',
  './emergency.html',
  './projects.html',
  './tracking.html',
  './contact.html',
  './assets/css/style.css',
  './assets/css/crane-loader.css',
  './assets/js/main.js',
  './assets/js/crane-audio.js',
  './assets/js/crane-engine.js',
  './assets/js/crane-loader.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('SNC SW: Some optional assets could not be cached immediately:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests for http/https schemes
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        return networkResponse;
      }).catch(() => {
        // Fallback for HTML documents if offline
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
