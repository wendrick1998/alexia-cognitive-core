
const CACHE_NAME = 'alex-ia-v1.0.0';
const STATIC_CACHE = 'alex-ia-static-v1';
const DYNAMIC_CACHE = 'alex-ia-dynamic-v1';
const API_CACHE = 'alex-ia-api-v1';

// Priority-based caching strategy
const CACHE_STRATEGIES = {
  critical: ['/', '/index.html', '/src/main.tsx', '/src/App.tsx'],
  important: ['/static/js/', '/static/css/', '/manifest.json'],
  normal: ['/api/memories', '/api/conversations'],
  low: ['/api/analytics', '/api/logs']
};

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('SW: Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache critical resources
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll([
          '/',
          '/index.html',
          '/manifest.json',
          '/favicon.ico',
          // Add critical assets
          ...CACHE_STRATEGIES.critical
        ]);
      }),
      
      // Initialize IndexedDB for offline data
      initOfflineDB()
    ])
  );
  
  // Force activation
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE &&
                cacheName !== API_CACHE) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Claim all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - intelligent caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome-extension
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }
  
  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  // API requests - cache-first with network fallback
  if (url.pathname.startsWith('/api/')) {
    return handleAPIRequest(request);
  }
  
  // Static assets - cache-first
  if (url.pathname.includes('/static/') || 
      url.pathname.endsWith('.js') || 
      url.pathname.endsWith('.css') || 
      url.pathname.endsWith('.png') || 
      url.pathname.endsWith('.jpg') || 
      url.pathname.endsWith('.svg')) {
    return handleStaticAsset(request);
  }
  
  // HTML pages - network-first with cache fallback
  return handleHTMLRequest(request);
}

async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    // Try network first for fresh data
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    // If network fails, try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If both fail, return offline response
    return createOfflineResponse(request);
    
  } catch (error) {
    console.log('SW: Network error, trying cache:', error);
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return createOfflineResponse(request);
  }
}

async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Try network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('SW: Failed to fetch asset:', error);
  }
  
  // Return placeholder if needed
  return new Response('Asset not available offline', { status: 404 });
}

async function handleHTMLRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('SW: Network error for HTML:', error);
  }
  
  // Try cache
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Return offline page
  return cache.match('/') || new Response('Offline', { status: 200 });
}

function createOfflineResponse(request) {
  const url = new URL(request.url);
  
  // Basic offline AI responses
  if (url.pathname.includes('/api/chat')) {
    return new Response(JSON.stringify({
      message: "Estou funcionando offline com capacidades limitadas. Suas mensagens serão sincronizadas quando a conexão for restabelecida.",
      offline: true,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (url.pathname.includes('/api/memories')) {
    return new Response(JSON.stringify({
      memories: [],
      offline: true,
      message: "Memórias serão sincronizadas quando online"
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({
    error: "Serviço indisponível offline",
    offline: true
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Initialize offline database
async function initOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AlexIAOffline', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Store for offline memories
      if (!db.objectStoreNames.contains('offline_memories')) {
        const store = db.createObjectStore('offline_memories', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('synced', 'synced');
      }
      
      // Store for offline messages
      if (!db.objectStoreNames.contains('offline_messages')) {
        const store = db.createObjectStore('offline_messages', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('synced', 'synced');
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Background sync for memories
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'memory-sync') {
    event.waitUntil(syncOfflineMemories());
  }
  
  if (event.tag === 'message-sync') {
    event.waitUntil(syncOfflineMessages());
  }
});

async function syncOfflineMemories() {
  try {
    const db = await initOfflineDB();
    const transaction = db.transaction(['offline_memories'], 'readonly');
    const store = transaction.objectStore('offline_memories');
    const index = store.index('synced');
    
    const unsyncedMemories = await new Promise((resolve, reject) => {
      const request = index.getAll(false);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    for (const memory of unsyncedMemories) {
      try {
        const response = await fetch('/api/memories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memory)
        });
        
        if (response.ok) {
          // Mark as synced
          const updateTransaction = db.transaction(['offline_memories'], 'readwrite');
          const updateStore = updateTransaction.objectStore('offline_memories');
          memory.synced = true;
          updateStore.put(memory);
        }
      } catch (error) {
        console.log('SW: Failed to sync memory:', error);
      }
    }
  } catch (error) {
    console.log('SW: Sync error:', error);
  }
}

async function syncOfflineMessages() {
  // Similar implementation for messages
  console.log('SW: Syncing offline messages...');
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('SW: Push received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível!',
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

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('SW: Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CACHE_MEMORY') {
    event.waitUntil(cacheOfflineData('memory', event.data.payload));
  }
  
  if (event.data.type === 'GET_CACHE_STATUS') {
    event.ports[0].postMessage({
      cached: true,
      version: CACHE_NAME
    });
  }
});

async function cacheOfflineData(type, data) {
  try {
    const db = await initOfflineDB();
    const transaction = db.transaction([`offline_${type}s`], 'readwrite');
    const store = transaction.objectStore(`offline_${type}s`);
    
    await new Promise((resolve, reject) => {
      const request = store.add({
        ...data,
        timestamp: new Date(),
        synced: false
      });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    console.log(`SW: Cached offline ${type}:`, data);
  } catch (error) {
    console.log(`SW: Failed to cache ${type}:`, error);
  }
}
