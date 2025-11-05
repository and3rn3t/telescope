// Service Worker for caching static assets and improving load performance
const CACHE_NAME = 'jwst-explorer-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  // Add critical CSS and JS files that should be cached
]

// Assets to cache on install
const CACHE_FIRST_ASSETS = [
  // Fonts, icons, and other static assets that rarely change
  '/assets/icons-',
  '/assets/vendor-',
  '/assets/ui-',
]

// Install event - cache critical assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
})

// Fetch event - serve from cache first for static assets
self.addEventListener('fetch', event => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Check if this is a cacheable asset
  const isCacheableAsset = CACHE_FIRST_ASSETS.some(pattern => request.url.includes(pattern))

  if (isCacheableAsset) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse
        }

        return fetch(request).then(response => {
          // Cache the response for future use
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
      })
    )
  }
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})
