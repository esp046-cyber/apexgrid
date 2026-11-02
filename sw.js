const CACHE_NAME = 'apexgrid-v202611021200';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './offline.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './data/standings.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/splash/splash-1290x2796.png',
  './icons/splash/splash-1179x2556.png',
  './icons/splash/splash-1170x2532.png',
  './icons/splash/splash-750x1334.png',
  './icons/splash/splash-1668x2388.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isAppShellPath(pathname) {
  return pathname.endsWith('/') || pathname.endsWith('/index.html');
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Page navigations: network first; offline -> cached shell for app routes, offline.html otherwise.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && isAppShellPath(url.pathname)) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          if (isAppShellPath(url.pathname)) {
            return (await cache.match('./index.html')) || (await cache.match('./offline.html'));
          }
          return (await cache.match(request)) || (await cache.match('./offline.html'));
        })
    );
    return;
  }

  // Standings data: network first (fresh numbers), cache fallback.
  if (url.pathname.endsWith('/data/standings.json')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || new Response('{"error":"offline"}', {
          status: 503, headers: { 'Content-Type': 'application/json' }
        })))
    );
    return;
  }

  // Other assets: stale-while-revalidate, with a real response on total failure.
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached || new Response('Offline', { status: 503, statusText: 'Offline' }));
      return cached || networkFetch;
    })
  );
});
