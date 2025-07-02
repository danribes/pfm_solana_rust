// Task 6.6.4: CDN Integration & Performance Optimization
// Service Worker for PWA Features and Performance Optimization

const CACHE_NAME = 'pfm-community-v1.0.0';
const CACHE_VERSION = '1.0.0';
const OFFLINE_PAGE = '/offline.html';

// Cache strategies
const CACHE_STRATEGIES = {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first', 
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
    NETWORK_ONLY: 'network-only',
    CACHE_ONLY: 'cache-only'
};

// Resource caching rules
const CACHE_RULES = [
    {
        pattern: /\.(js|css|woff|woff2|ttf|eot)$/,
        strategy: CACHE_STRATEGIES.CACHE_FIRST,
        cacheName: 'static-assets',
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        maxEntries: 100
    },
    {
        pattern: /\.(png|jpg|jpeg|gif|webp|avif|svg|ico)$/,
        strategy: CACHE_STRATEGIES.CACHE_FIRST,
        cacheName: 'images',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        maxEntries: 200
    },
    {
        pattern: /^https:\/\/api\.pfm-community\.app\/communities\/public/,
        strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
        cacheName: 'api-public',
        maxAge: 5 * 60 * 1000, // 5 minutes
        maxEntries: 50
    },
    {
        pattern: /^https:\/\/api\.pfm-community\.app\/stats/,
        strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
        cacheName: 'api-stats',
        maxAge: 10 * 60 * 1000, // 10 minutes
        maxEntries: 20
    },
    {
        pattern: /\.(html|htm)$/,
        strategy: CACHE_STRATEGIES.NETWORK_FIRST,
        cacheName: 'pages',
        maxAge: 60 * 60 * 1000, // 1 hour
        maxEntries: 30
    }
];

// Assets to precache
const PRECACHE_ASSETS = [
    '/',
    '/admin',
    '/member',
    '/offline.html',
    '/manifest.json',
    '/assets/css/main.css',
    '/assets/js/app.js',
    '/assets/js/vendor.js',
    '/assets/images/logo.png',
    '/assets/images/logo-192.png',
    '/assets/images/logo-512.png'
];

// Service Worker Event Listeners

// Install event - precache resources
self.addEventListener('install', event => {
    console.log('[ServiceWorker] Install event');
    
    event.waitUntil(
        (async () => {
            try {
                const cache = await caches.open(CACHE_NAME);
                
                console.log('[ServiceWorker] Precaching assets...');
                
                // Precache critical assets
                const precachePromises = PRECACHE_ASSETS.map(async (url) => {
                    try {
                        const response = await fetch(url, {
                            cache: 'no-cache',
                            credentials: 'same-origin'
                        });
                        
                        if (response.ok) {
                            await cache.put(url, response);
                            console.log(`[ServiceWorker] Precached: ${url}`);
                        } else {
                            console.warn(`[ServiceWorker] Failed to precache: ${url} (${response.status})`);
                        }
                    } catch (error) {
                        console.warn(`[ServiceWorker] Error precaching ${url}:`, error);
                    }
                });
                
                await Promise.allSettled(precachePromises);
                
                console.log('[ServiceWorker] Precaching completed');
                
                // Skip waiting to activate immediately
                self.skipWaiting();
            } catch (error) {
                console.error('[ServiceWorker] Install failed:', error);
            }
        })()
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[ServiceWorker] Activate event');
    
    event.waitUntil(
        (async () => {
            try {
                // Clean up old caches
                const cacheNames = await caches.keys();
                const deletionPromises = cacheNames
                    .filter(cacheName => 
                        cacheName.startsWith('pfm-community-') && 
                        cacheName !== CACHE_NAME
                    )
                    .map(cacheName => {
                        console.log(`[ServiceWorker] Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    });
                
                await Promise.all(deletionPromises);
                
                // Take control of all pages
                await self.clients.claim();
                
                console.log('[ServiceWorker] Activation completed');
            } catch (error) {
                console.error('[ServiceWorker] Activation failed:', error);
            }
        })()
    );
});

// Fetch event - handle network requests
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-HTTP requests
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    // Skip POST requests and other methods that shouldn't be cached
    if (request.method !== 'GET') {
        return;
    }
    
    // Find matching cache rule
    const rule = findCacheRule(request.url);
    
    if (rule) {
        event.respondWith(handleCachedRequest(request, rule));
    } else {
        // Default to network-first for unmatched requests
        event.respondWith(networkFirst(request, 'default'));
    }
});

// Message event - handle messages from clients
self.addEventListener('message', event => {
    const { data } = event;
    
    switch (data.type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_VERSION':
            event.ports[0].postMessage({
                type: 'VERSION',
                version: CACHE_VERSION
            });
            break;
            
        case 'CLEAR_CACHE':
            clearCache(data.cacheName || CACHE_NAME)
                .then(() => {
                    event.ports[0].postMessage({
                        type: 'CACHE_CLEARED',
                        success: true
                    });
                })
                .catch(error => {
                    event.ports[0].postMessage({
                        type: 'CACHE_CLEARED',
                        success: false,
                        error: error.message
                    });
                });
            break;
            
        case 'PRECACHE_ASSETS':
            precacheAssets(data.assets || [])
                .then(() => {
                    event.ports[0].postMessage({
                        type: 'ASSETS_PRECACHED',
                        success: true
                    });
                })
                .catch(error => {
                    event.ports[0].postMessage({
                        type: 'ASSETS_PRECACHED',
                        success: false,
                        error: error.message
                    });
                });
            break;
    }
});

// Background sync event
self.addEventListener('sync', event => {
    console.log('[ServiceWorker] Background sync:', event.tag);
    
    switch (event.tag) {
        case 'background-analytics':
            event.waitUntil(syncAnalytics());
            break;
            
        case 'cache-cleanup':
            event.waitUntil(cleanupExpiredCache());
            break;
    }
});

// Push event - handle push notifications
self.addEventListener('push', event => {
    console.log('[ServiceWorker] Push received');
    
    const options = {
        body: 'You have new updates in PFM Community',
        icon: '/assets/images/logo-192.png',
        badge: '/assets/images/badge-72.png',
        tag: 'pfm-notification',
        renotify: true,
        requireInteraction: false,
        actions: [
            {
                action: 'open',
                title: 'Open App',
                icon: '/assets/images/open-icon.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: '/assets/images/dismiss-icon.png'
            }
        ]
    };
    
    if (event.data) {
        try {
            const payload = event.data.json();
            Object.assign(options, payload);
        } catch (error) {
            console.warn('[ServiceWorker] Invalid push payload:', error);
        }
    }
    
    event.waitUntil(
        self.registration.showNotification('PFM Community', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', event => {
    console.log('[ServiceWorker] Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then(clientList => {
                // Focus existing window if available
                for (const client of clientList) {
                    if (client.url.includes('pfm-community.app') && 'focus' in client) {
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

// Helper Functions

function findCacheRule(url) {
    return CACHE_RULES.find(rule => {
        if (rule.pattern instanceof RegExp) {
            return rule.pattern.test(url);
        } else if (typeof rule.pattern === 'string') {
            return url.includes(rule.pattern);
        }
        return false;
    });
}

async function handleCachedRequest(request, rule) {
    switch (rule.strategy) {
        case CACHE_STRATEGIES.CACHE_FIRST:
            return cacheFirst(request, rule.cacheName);
            
        case CACHE_STRATEGIES.NETWORK_FIRST:
            return networkFirst(request, rule.cacheName);
            
        case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
            return staleWhileRevalidate(request, rule.cacheName);
            
        case CACHE_STRATEGIES.NETWORK_ONLY:
            return fetch(request);
            
        case CACHE_STRATEGIES.CACHE_ONLY:
            return cacheOnly(request, rule.cacheName);
            
        default:
            return networkFirst(request, rule.cacheName);
    }
}

async function cacheFirst(request, cacheName) {
    try {
        const cache = await caches.open(cacheName || CACHE_NAME);
        const cached = await cache.match(request);
        
        if (cached) {
            return cached;
        }
        
        const response = await fetch(request);
        
        if (response.ok) {
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.warn('[ServiceWorker] Cache first failed:', error);
        return handleOffline(request);
    }
}

async function networkFirst(request, cacheName) {
    try {
        const response = await fetch(request);
        
        if (response.ok) {
            const cache = await caches.open(cacheName || CACHE_NAME);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.warn('[ServiceWorker] Network first failed, trying cache:', error);
        
        const cache = await caches.open(cacheName || CACHE_NAME);
        const cached = await cache.match(request);
        
        if (cached) {
            return cached;
        }
        
        return handleOffline(request);
    }
}

async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName || CACHE_NAME);
    const cached = await cache.match(request);
    
    // Always try to update in background
    const fetchPromise = fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(error => {
        console.warn('[ServiceWorker] Background revalidation failed:', error);
    });
    
    // Return cached version immediately if available
    if (cached) {
        return cached;
    }
    
    // Otherwise wait for network
    try {
        return await fetchPromise;
    } catch (error) {
        return handleOffline(request);
    }
}

async function cacheOnly(request, cacheName) {
    const cache = await caches.open(cacheName || CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
        return cached;
    }
    
    return handleOffline(request);
}

async function handleOffline(request) {
    const url = new URL(request.url);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
        const cache = await caches.open(CACHE_NAME);
        return cache.match(OFFLINE_PAGE) || new Response('Offline', { status: 503 });
    }
    
    // Return placeholder for images
    if (request.destination === 'image') {
        return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="#ddd"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Image Unavailable</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
        );
    }
    
    // Return generic offline response
    return new Response('Content unavailable offline', { status: 503 });
}

async function clearCache(cacheName) {
    return caches.delete(cacheName);
}

async function precacheAssets(assets) {
    const cache = await caches.open(CACHE_NAME);
    
    const precachePromises = assets.map(async (url) => {
        try {
            const response = await fetch(url);
            if (response.ok) {
                await cache.put(url, response);
            }
        } catch (error) {
            console.warn(`[ServiceWorker] Failed to precache ${url}:`, error);
        }
    });
    
    await Promise.allSettled(precachePromises);
}

async function syncAnalytics() {
    try {
        // Sync any pending analytics data
        console.log('[ServiceWorker] Syncing analytics data');
        
        // Implementation would depend on analytics system
        // This is a placeholder for background sync functionality
        
    } catch (error) {
        console.error('[ServiceWorker] Analytics sync failed:', error);
    }
}

async function cleanupExpiredCache() {
    try {
        console.log('[ServiceWorker] Cleaning up expired cache');
        
        for (const rule of CACHE_RULES) {
            if (rule.maxAge) {
                const cache = await caches.open(rule.cacheName);
                const requests = await cache.keys();
                
                for (const request of requests) {
                    const response = await cache.match(request);
                    if (response) {
                        const dateHeader = response.headers.get('date');
                        if (dateHeader) {
                            const age = Date.now() - new Date(dateHeader).getTime();
                            if (age > rule.maxAge) {
                                await cache.delete(request);
                                console.log(`[ServiceWorker] Deleted expired cache entry: ${request.url}`);
                            }
                        }
                    }
                }
                
                // Limit cache entries
                if (rule.maxEntries) {
                    const remainingRequests = await cache.keys();
                    if (remainingRequests.length > rule.maxEntries) {
                        const excessRequests = remainingRequests.slice(rule.maxEntries);
                        for (const request of excessRequests) {
                            await cache.delete(request);
                        }
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('[ServiceWorker] Cache cleanup failed:', error);
    }
}

console.log(`[ServiceWorker] Service Worker ${CACHE_VERSION} loaded`);
