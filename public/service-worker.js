const CACHE_NAME = 'weather-app-v1.2';
const ASSETS = [
    '/',
    '/index.html',
    '/app.js',
    '/style.css',
    '/icons/rainy.png',
    '/icons/cloudy.png',
    '/icons/sunny.png',
    '/icons/default.png',
    '/icons/weather-icon-192x192.png',
    '/icons/weather-icon-512x512.png',
    '/screenshots/screenshot1.png',
    '/screenshots/screenshot2.png',
    '/settings.html',
    '/settings.css',
    '/settings.js'
];

// Install event: Cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching assets...');
            return cache.addAll(ASSETS);
        }).catch((err) => {
            console.error('Failed to cache assets:', err);
        })
    );
    self.skipWaiting(); // Force the new Service Worker to activate immediately
});

// Activate event: Clean up old caches
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
    self.clients.claim(); // Force the new Service Worker to take control immediately
});

// Handle Push Notifications
self.addEventListener('push', (event) => {
    let data = {};
    
    // Attempt to parse the push message as JSON
    try {
        data = event.data.json();
    } catch (e) {
        console.error('Failed to parse push message data as JSON:', e);
        data = { title: 'Weather Update', body: 'New weather data is available!' }; // Default fallback
    }

    const title = data.title || 'Weather Notification';
    const options = {
        body: data.body || 'No body content provided.',
        icon: '/icons/weather-icon-192x192.png', // Specify icon for notification
        badge: '/icons/weather-icon-512x512.png', // Badge icon
        vibrate: [200, 100, 200], // Vibrate pattern
    };

    // Show the notification
    event.waitUntil(self.registration.showNotification(title, options));
});

// Fetch event: Serve cached content or fetch from network
self.addEventListener('fetch', (event) => {
    console.log('Fetching:', event.request.url); // Log the request URL for debugging

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // If the resource is in the cache, return it, else fetch from network
            return cachedResponse || fetch(event.request).catch((err) => {
                console.error('Fetch failed:', err);
                // Optional fallback response if the network fails (e.g., offline mode)
                return new Response('Network error', { status: 503 });
            });
        })
    );
});
