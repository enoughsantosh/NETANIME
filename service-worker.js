const CACHE_NAME = 'anime-api-cache-v1';
const API_URL = 'https://aniwatch-api-v1-0.onrender.com/api/parse';

// Install event: Cache essential files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll([
                '/', // Cache the main page
                '/index.html',

            ]);
        })
    );
});

// Activate event: Cleanup old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
});

// Fetch event: Intercept API requests and serve from cache
self.addEventListener('fetch', event => {
    if (event.request.url.includes(API_URL)) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return fetch(event.request)
                    .then(response => {
                        cache.put(event.request, response.clone()); // Cache the new response
                        return response;
                    })
                    .catch(() => caches.match(event.request)); // Serve from cache if offline
            })
        );
    } else {
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request);
            })
        );
    }
});