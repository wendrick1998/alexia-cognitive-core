
const CACHE_NAME = 'alex-ia-v1.0.2';
const STATIC_CACHE = 'alex-ia-static-v1.0.2';
const DYNAMIC_CACHE = 'alex-ia-dynamic-v1.0.2';

// Recursos críticos que DEVEM ser cacheados
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Install - Cache recursos críticos
self.addEventListener('install', (event) => {
  console.log('SW: Installing v1.0.2');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('SW: Caching critical resources');
        return cache.addAll(CRITICAL_RESOURCES);
      })
      .catch(error => {
        console.error('SW: Install failed:', error);
        return Promise.resolve();
      })
  );
  
  self.skipWaiting();
});

// Activate - Limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('SW: Activating v1.0.2');
  
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
      self.clients.claim()
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
  
  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // HTML - Network first com cache fallback
    if (url.pathname === '/' || url.pathname.endsWith('.html') || !url.pathname.includes('.')) {
      return await handleHTMLRequest(request);
    }
    
    // Assets estáticos - Cache first
    if (isStaticAsset(url.pathname)) {
      return await handleStaticAsset(request);
    }
    
    // Default - Network first
    return await handleNetworkFirst(request);
    
  } catch (error) {
    console.error('SW: Fetch error:', error);
    return createOfflineResponse();
  }
}

function isStaticAsset(pathname) {
  return pathname.includes('/assets/') ||
         pathname.includes('/static/') ||
         pathname.endsWith('.js') ||
         pathname.endsWith('.css') ||
         pathname.endsWith('.png') ||
         pathname.endsWith('.jpg') ||
         pathname.endsWith('.svg') ||
         pathname.endsWith('.ico') ||
         pathname.endsWith('.woff') ||
         pathname.endsWith('.woff2');
}

async function handleHTMLRequest(request) {
  try {
    // Tentar network primeiro
    const networkResponse = await fetch(request, { 
      cache: 'no-cache',
      credentials: 'same-origin'
    });
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('SW: Network failed for HTML');
  }
  
  // Fallback para cache
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match('/index.html') || await cache.match('/');
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Último recurso - HTML básico
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Alex iA</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: system-ui, -apple-system, sans-serif; 
            background: #111827; 
            color: white; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
          }
          .container { text-align: center; max-width: 400px; }
          .spinner { 
            border: 3px solid #374151; 
            border-top: 3px solid #3b82f6; 
            border-radius: 50%; 
            width: 40px; 
            height: 40px; 
            animation: spin 1s linear infinite; 
            margin: 0 auto 20px;
          }
          @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
          }
          button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 16px;
          }
          button:hover { background: #2563eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <h2>Alex iA</h2>
          <p>Carregando aplicação...</p>
          <button onclick="location.reload()">Tentar Novamente</button>
        </div>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  // Cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Network fallback
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('SW: Network failed for asset:', request.url);
  }
  
  return new Response('Asset not found', { status: 404 });
}

async function handleNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      return networkResponse;
    }
  } catch (error) {
    console.log('SW: Network failed for:', request.url);
  }
  
  // Cache fallback
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  return cachedResponse || createOfflineResponse();
}

function createOfflineResponse() {
  return new Response('Offline', { 
    status: 503,
    statusText: 'Service Unavailable'
  });
}

// Message handling
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
