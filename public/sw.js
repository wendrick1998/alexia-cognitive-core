
const CACHE_NAME = 'alex-ia-v1.0.4';
const STATIC_CACHE = 'alex-ia-static-v1.0.4';
const DYNAMIC_CACHE = 'alex-ia-dynamic-v1.0.4';

// Recursos críticos que DEVEM ser cacheados - Atualizados para Módulo 2
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // Ícones PWA
  '/icon-72x72.png',
  '/icon-96x96.png',
  '/icon-128x128.png',
  '/icon-144x144.png',
  '/icon-152x152.png',
  '/icon-192x192.png',
  '/icon-384x384.png',
  '/icon-512x512.png',
  // Assets principais (padrão Vite)
  '/assets/index.js',
  '/assets/index.css',
  // Recursos para offline
  '/offline.html'
];

// Install - Cache recursos críticos
self.addEventListener('install', (event) => {
  console.log('SW: Installing v1.0.4');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('SW: Caching critical resources');
        // Cache recursos individuais com tratamento de erro
        return Promise.allSettled(
          CRITICAL_RESOURCES.map(resource => 
            cache.add(resource).catch(error => {
              console.warn(`SW: Failed to cache ${resource}:`, error);
              return Promise.resolve();
            })
          )
        );
      })
      .then(() => {
        return self.skipWaiting(); // Ativa o SW imediatamente
      })
      .catch(error => {
        console.error('SW: Install failed:', error);
        return Promise.resolve();
      })
  );
});

// Activate - Limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('SW: Activating v1.0.4');
  
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName.includes('alex-ia') && 
                cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      clients.claim() // Assume o controle de todos os clientes abertos
    ])
  );
});

// Fetch - Estratégias de cache inteligentes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests e extensões
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Skip requests do Lovable
  if (url.hostname.includes('lovable.dev') || url.pathname.includes('/_lovable/')) {
    return;
  }

  // Skip requests de outros origens
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // Estratégia Network-First para navegação (páginas HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache a resposta para uso futuro
          if (response.ok) {
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, response.clone());
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback para página offline
          return caches.match('/offline.html') || 
                 caches.match('/index.html') ||
                 new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // Estratégia Cache-First para assets estáticos (CSS, JS, imagens, fontes, etc.)
  if (
    url.pathname.includes('/assets/') || // Pasta onde Vite coloca os assets
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.gif') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.ttf') ||
    url.pathname.endsWith('.eot') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.startsWith('/icon-')
  ) {
    event.respondWith(
      caches.match(request).then(response => {
        // Retorna do cache se encontrado
        if (response) {
          return response;
        }
        // Se não estiver no cache, busca na rede, armazena e retorna
        return fetch(request).then(networkResponse => {
          if (networkResponse.ok) {
            return caches.open(STATIC_CACHE).then(cache => {
              cache.put(request, networkResponse.clone());
              return networkResponse;
            });
          }
          return networkResponse;
        }).catch(error => {
          console.error('SW: Fetch failed for static asset:', error);
          // Fallback básico para assets
          return new Response('Asset not available offline', { status: 404 });
        });
      })
    );
    return;
  }

  // Estratégia Network-First para chamadas de API
  if (
    url.pathname.includes('/api/') || 
    url.pathname.includes('/rest/v1/') || // Supabase REST API
    url.pathname.includes('/functions/v1/') || // Supabase Edge Functions
    url.pathname.includes('supabase')
  ) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          // Cacheia a resposta da rede para uso futuro (apenas GET requests bem-sucedidas)
          if (networkResponse.ok && request.method === 'GET') {
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Se a rede falhar, tenta servir do cache
          return caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Retorna resposta offline para APIs
            return new Response(JSON.stringify({
              error: 'Offline - API não disponível',
              offline: true,
              timestamp: new Date().toISOString()
            }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Estratégia padrão Network-First para outras requisições
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, response.clone());
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request) || new Response('Offline', { status: 503 });
      })
  );
});

// Message handling
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME,
      cached: true
    });
  }
});

// Background sync para PWA
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('SW: Performing background sync...');
  // Implementar sincronização de dados offline
}

// Push notifications para PWA
self.addEventListener('push', (event) => {
  console.log('SW: Push received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização do Alex iA!',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir Alex iA',
        icon: '/icon-32x32.png'
      },
      {
        action: 'dismiss',
        title: 'Dispensar'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Alex iA', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});
