const CACHE_NAME = 'laromana-v4';
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

// Escuchar mensajes desde la app (ej: limpiar caché bajo demanda)
self.addEventListener('message', event => {
  if (event.data) {
    if (event.data.action === 'skipWaiting') {
      self.skipWaiting();
    }
    if (event.data.action === 'clearCache') {
      caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.map(c => caches.delete(c)));
      });
    }
  }
});

self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Ignorar peticiones a APIs o PHP para que siempre vayan directas a la red
  if (url.includes('/backend/') || url.includes('.php') || url.includes('api_') || event.request.method !== 'GET') {
    return;
  }

  // 1. ESTRATEGIA NETWORK-FIRST PARA NAVEGACIÓN Y HTML (index.html)
  // De esta forma, si el celular tiene internet, SIEMPRE descarga la versión más reciente del servidor
  if (event.request.mode === 'navigate' || event.request.destination === 'document' || url.endsWith('/index.html') || url === self.registration.scope) {
    event.respondWith(
      fetch(event.request)
        .then(fetchResponse => {
          if (fetchResponse && fetchResponse.status === 200) {
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
          }
          return fetchResponse;
        })
        .catch(() => {
          // Si no hay red, servir la última versión guardada en caché
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // 2. ESTRATEGIA STALE-WHILE-REVALIDATE PARA EL RESTO DE RECURSOS ESTÁTICOS
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
