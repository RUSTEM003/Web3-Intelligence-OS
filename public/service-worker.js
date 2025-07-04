const CACHE_NAME = 'medtour-v1.0.0';
const STATIC_CACHE_NAME = 'medtour-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'medtour-dynamic-v1.0.0';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

const API_CACHE_DURATION = 5 * 60 * 1000;
const STATIC_CACHE_DURATION = 24 * 60 * 60 * 1000;

self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Error caching static assets:', error);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else if (STATIC_ASSETS.includes(url.pathname) || url.pathname.startsWith('/icons/')) {
    event.respondWith(handleStaticRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

async function handleStaticRequest(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      const cachedDate = new Date(cachedResponse.headers.get('date'));
      const now = new Date();
      
      if (now - cachedDate < STATIC_CACHE_DURATION) {
        console.log('Service Worker: Serving from static cache:', request.url);
        return cachedResponse;
      }
    }

    console.log('Service Worker: Fetching and caching static asset:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Static request failed:', error);
    
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    if (request.url.includes('.html') || request.url.endsWith('/')) {
      return caches.match('/index.html');
    }
    
    return new Response('Offline - Resource not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

async function handleApiRequest(request) {
  try {
    console.log('Service Worker: Fetching API request:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: API request failed, trying cache:', error);
    
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      const cachedDate = new Date(cachedResponse.headers.get('date'));
      const now = new Date();
      
      if (now - cachedDate < API_CACHE_DURATION) {
        console.log('Service Worker: Serving API from cache:', request.url);
        return cachedResponse;
      }
    }
    
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'API недоступен в автономном режиме',
      cached: false
    }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

async function handleDynamicRequest(request) {
  try {
    console.log('Service Worker: Fetching dynamic request:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Dynamic request failed, trying cache:', error);
    
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Service Worker: Serving from dynamic cache:', request.url);
      return cachedResponse;
    }
    
    if (request.url.includes('.html') || request.url.endsWith('/')) {
      const indexCache = await caches.match('/index.html');
      if (indexCache) {
        return indexCache;
      }
    }
    
    return new Response('Offline - Page not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Received skip waiting message');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME,
      static: STATIC_CACHE_NAME,
      dynamic: DYNAMIC_CACHE_NAME
    });
  }
});

self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    console.log('Service Worker: Performing background sync');
    
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/api/')) {
        try {
          const response = await fetch(request);
          if (response.ok) {
            await cache.put(request, response.clone());
          }
        } catch (error) {
          console.log('Service Worker: Background sync failed for:', request.url);
        }
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync error:', error);
  }
}

self.addEventListener('push', event => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Новое уведомление от MEDTOUR',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Открыть MEDTOUR',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Закрыть',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('MEDTOUR', options)
  );
});

self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    event.notification.close();
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('Service Worker: Script loaded successfully');
