const CACHE_NAME = 'laromana-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/Logo_romana_dorado.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Ignorar peticiones a APIs o PHP para que siempre vayan directas a la red
  const url = event.request.url;
  if (url.includes('/backend/') || url.includes('.php') || url.includes('api_') || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResponse => {
        // Cachear dinámicamente recursos estáticos
        if (fetchResponse && fetchResponse.status === 200 && fetchResponse.type === 'basic') {
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return fetchResponse;
      }).catch(() => {
        // Si no hay red y es navegación, retornar index.html en cache
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
