// sw.js - VERSIÓN CORREGIDA para GitHub Page
const CACHE_NAME = 'consultas-telefonicas-v5';
const urlsToCache = [
  './',                    // IMPORTANTE: ./ en lugar de /
  './index.html',
  './manifest.json',
  './icon-144x144.png',
  './script.js',
  './style.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto:', CACHE_NAME);
        return cache.addAll(urlsToCache).catch(error => {
          console.error('Error al cachear:', error);
        });
      })
  );
  // Fuerza a activar inmediatamente
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Toma control inmediato de todas las pestañas
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Solo cachear solicitudes GET
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - devuelve respuesta
        if (response) {
          return response;
        }
        
        // Clonar la request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest)
          .then(response => {
            // Verificar respuesta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clonar para cachear
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.error('Error en fetch:', error);
            // Podrías devolver una página offline aquí
            return caches.match('./index.html');
          });
      })
  );
});
