self.addEventListener('push', (event) => {
    const data = event.data.json();
    const title = data.title;
    const options = {
        body: data.body,
        icon: '/icons/weather-icon.png',
        badge: '/icons/weather-icon.png',
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

const CACHE_NAME = 'weather-app-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/app.js',
    '/styles.css',
    '/icons/rainy.png',
    '/icons/cloudy.png',
    '/icons/sunny.png',
];

// Install Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching app assets');
            return cache.addAll(ASSETS);
        })
    );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Clearing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Fetch Event - Serve from Cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});
