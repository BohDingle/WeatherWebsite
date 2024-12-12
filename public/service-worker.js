const CACHE_NAME = 'weather-app-v3';
const ASSETS = [
    '/',
    '/index.html',
    '/app.js',
    '/style.css',
    '/icons/rainy.png',
    '/icons/cloudy.png',
    '/icons/sunny.png',
    '/icons/default.png',
];


// Handle Push Notifications
self.addEventListener('push', (event) => {
    let data;

    try {
        data = event.data.json();  // Parse the push message as JSON
    } catch (e) {
        console.error('Failed to parse push message data as JSON:', e);
        return;
    }

    const title = data.title || 'Default Title';
    const options = {
        body: data.body || 'No body text provided',
        icon: '/icons/weather-icon.png',
        badge: '/icons/weather-icon.png',
    };

    event.waitUntil(self.registration.showNotification(title, options));
});


// Install Service Worker and Cache Assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            try {
                await Promise.all(
                    ASSETS.map(async (asset) => {
                        const response = await fetch(asset);
                        if (response.ok) {
                            await cache.put(asset, response);
                        } else {
                            console.error(`Failed to cache: ${asset}`);
                        }
                    })
                );
                console.log('All assets cached successfully');
            } catch (error) {
                console.error('Error caching assets:', error);
            }
        })
    );
    self.skipWaiting(); // Force the new Service Worker to activate immediately
});


// Activate Service Worker and Clear Old Caches
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

// Fetch Event - Serve from Cache or Network
self.addEventListener('fetch', (event) => {
    console.log('Fetching:', event.request.url); // Log the request URL to debug

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // If the resource is in the cache, return it, otherwise, fetch it
            return cachedResponse || fetch(event.request).catch((err) => {
                console.error('Fetch failed:', err);
                return new Response('Network error', { status: 503 }); // Optional: handle error with a fallback response
            });
        })
    );
});
