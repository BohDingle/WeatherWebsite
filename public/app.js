document.addEventListener('DOMContentLoaded', async () => {
    const weatherContainer = document.getElementById('weather-container');

    try {
        const response = await fetch('/api/weather');
        const weatherLogs = await response.json();

        weatherContainer.innerHTML = ''; // Clear previous content

        // Generate a weather card for each forecast day
        weatherLogs.forEach((log) => {
            const card = document.createElement('div');
            card.className = 'weather-card';

            const date = new Date(log.date);
            const formattedDate = date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
            const formattedDay = date.toLocaleDateString('en-GB', {
                weekday: 'long',
            });

            // Get the image path based on the weather description
            const weatherImage = getWeatherImage(log.weather.toLowerCase());

            // Add content to the weather card
            card.innerHTML = `
                <h2>${formattedDate}</h2>
                <h3>${formattedDay}, ${log.city}</h3>
                <img src="${weatherImage}" alt="${log.weather}" class="weather-image">
                <p>${log.temperature.toFixed(1)}°C</p>
                <p>${log.weather}</p>
            `;

            weatherContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching weather logs:', error);
    }
});
document.addEventListener('DOMContentLoaded', async () => {
    // Register the service worker
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker Registered:', registration);

            // Check if push notifications are supported
            if ('PushManager' in window) {
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true, // Ensures notifications are always visible
                    applicationServerKey: urlBase64ToUint8Array('<YOUR_VAPID_PUBLIC_KEY>'),
                });

                console.log('Push Subscription:', subscription);

                // Send subscription details to the server
                await fetch('/api/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(subscription),
                });

                console.log('User subscribed to push notifications.');
            }
        } catch (error) {
            console.error('Service Worker Registration or Push Subscription failed:', error);
        }
    }
});

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

// Function to map weather descriptions to image paths
function getWeatherImage(description) {
    if (description.includes('rain')) return '/icons/rainy.png';
    if (description.includes('cloud')) return '/icons/cloudy.png';
    if (description.includes('clear')) return '/icons/sunny.png';
    if (description.includes('snow')) return '/icons/snowy.png';
    return '/images/default.png'; // Fallback image
}
