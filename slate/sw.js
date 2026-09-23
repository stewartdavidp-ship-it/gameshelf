/**
 * Slate PWA Service Worker
 * Version: 1.0.24
 */
const CACHE_VERSION = 'v1.0.24';
const CACHE_NAME = `slate-pwa-${CACHE_VERSION}`;

const CACHE_FILES = [
    './',
    './index.html',
    './manifest.json'
];

self.addEventListener('install', (event) => {
    console.log('[SW] Installing:', CACHE_VERSION);
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_FILES.map((u) => new Request(u, { cache: 'reload' }))))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activating:', CACHE_VERSION);
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName.startsWith('slate-pwa-') && cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    
    const url = new URL(event.request.url);
    if (url.origin !== location.origin && !url.hostname.includes('fonts.googleapis.com') && !url.hostname.includes('fonts.gstatic.com')) {
        return;
    }
    
    // The page: network first (with a short timeout), cache as the offline fallback.
    // Serving the page stale-while-revalidate means a launch always renders the
    // PREVIOUS release, which is why an installed PWA appears never to update.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            Promise.race([
                fetch(event.request).then((response) => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((c) => c.put('./index.html', clone));
                    }
                    return response;
                }).catch(() => null),
                new Promise((resolve) => setTimeout(() => resolve(null), 2500))
            ]).then((response) => response || caches.match('./index.html').then((r) => r || caches.match('./')))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                event.waitUntil(
                    fetch(event.request).then((response) => {
                        if (response && response.status === 200) {
                            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
                        }
                    }).catch(() => {})
                );
                return cachedResponse;
            }
            
            return fetch(event.request).then((response) => {
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                }
                return response;
            }).catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
                return new Response('Offline', { status: 503 });
            });
        })
    );
});

console.log('[SW] Loaded:', CACHE_VERSION);
