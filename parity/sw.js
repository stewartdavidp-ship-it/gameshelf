/**
 * Parity PWA Service Worker
 * Version: 1.0.6
 *
 * The page itself is NETWORK-FIRST. A stale-while-revalidate page always shows
 * the previous release — you only ever see version N-1 — which is exactly the
 * "my PWA never updates" symptom. Everything else stays cache-first.
 */
const CACHE_VERSION = 'v1.0.6';
const CACHE_NAME = `parity-pwa-${CACHE_VERSION}`;
const CACHE_FILES = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) =>
            // {cache:'reload'} bypasses the HTTP cache, so a release is never
            // installed stale off the host's max-age=600.
            cache.addAll(CACHE_FILES.map((u) => new Request(u, { cache: 'reload' })))
        )
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) => Promise.all(
            names.map((n) => {
                if (n.startsWith('parity-pwa-') && n !== CACHE_NAME) return caches.delete(n);
            })
        )).then(() => self.clients.claim())
    );
});

function isPage(request, url) {
    return request.mode === 'navigate'
        || url.pathname.endsWith('/index.html')
        || url.pathname.endsWith('/parity/');
}

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url);
    if (url.origin !== location.origin && !url.hostname.includes('fonts.googleapis.com')) return;

    // The page: network first, cache only as the offline fallback.
    if (isPage(event.request, url)) {
        event.respondWith(
            fetch(event.request).then((response) => {
                if (response && response.status === 200) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((c) => c.put('./index.html', copy));
                }
                return response;
            }).catch(() =>
                caches.match('./index.html').then((r) => r || caches.match('./'))
            )
        );
        return;
    }

    // Everything else: cache first, refreshed in the background.
    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) {
                event.waitUntil(fetch(event.request).then((r) => {
                    if (r && r.status === 200) caches.open(CACHE_NAME).then((c) => c.put(event.request, r.clone()));
                }).catch(() => {}));
                return cached;
            }
            return fetch(event.request).then((response) => {
                if (response && response.status === 200) {
                    caches.open(CACHE_NAME).then((c) => c.put(event.request, response.clone()));
                }
                return response;
            }).catch(() => new Response('Offline', { status: 503 }));
        })
    );
});
