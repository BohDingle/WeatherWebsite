const vapidPublicKey = 'BA5hCLGNy8sMVOWuI7qm3RNmD-Bj220NFiQq0s07W4MMy-yCBWV3J48VBgF4CjEosZPDOsvjMaPOG-blTeOp5E0';
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const weatherLogs = await fetchWeatherData();
        renderWeatherCards(weatherLogs);
    } catch (error) {
        console.error('Error initializing weather app:', error);
    }

    registerServiceWorker();
    subscribeToPushNotifications();
});

// Fetch weather data from the API
async function fetchWeatherData() {
    try {
        const response = await fetch('/api/weather');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching weather logs:', error);
        throw error;
    }
}

// Render weather cards dynamically
function renderWeatherCards(weatherLogs) {
    const weatherContainer = document.getElementById('weather-container');
    weatherContainer.innerHTML = ''; // Clear previous content

    weatherLogs.forEach((log) => {
        const card = createWeatherCard(log);
        weatherContainer.appendChild(card);
    });
}

// Create a weather card element
function createWeatherCard(log) {
    const card = document.createElement('div');
    card.className = 'weather-card';

    const date = new Date(log.date);
    const formattedDate = formatDate(date, { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formattedDay = formatDate(date, { weekday: 'long' });

    const weatherImage = getWeatherImage(log.weather.toLowerCase());

    card.innerHTML = `
        <h2>${formattedDate}</h2>
        <h3>${formattedDay}, ${log.city}</h3>
        <img src="${weatherImage}" alt="${log.weather}" class="weather-image">
        <p>${log.temperature.toFixed(1)}°C</p>
        <p>${log.weather}</p>
    `;

    return card;
}

// Utility: Format a date
function formatDate(date, options) {
    return date.toLocaleDateString('en-GB', options);
}

// Utility: Map weather descriptions to image paths
function getWeatherImage(description) {
    if (description.includes('rain')) return '/icons/rainy.png';
    if (description.includes('cloud')) return '/icons/cloudy.png';
    if (description.includes('clear sky')) return '/icons/sunny.png';
    // Add additional mappings as needed
    return '/icons/default.png'; // Fallback image
}
// Register service worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered:', registration);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    }
}

// Subscribe to push notifications
function subscribeToPushNotifications() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        const publicKey = 'BA5hCLGNy8sMVOWuI7qm3RNmD-Bj220NFiQq0s07W4MMy-yCBWV3J48VBgF4CjEosZPDOsvjMaPOG-blTeOp5E0'; // Your VAPID public key

        navigator.serviceWorker.ready.then((registration) => {
            const options = {
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey),
            };

            registration.pushManager
                .subscribe(options)
                .then((subscription) => {
                    console.log('Push subscription successful:', subscription);

                    // Send subscription to the server
                    fetch('/subscribe', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(subscription),
                    });
                })
                .catch((error) => {
                    console.error('Failed to subscribe for push notifications:', error);
                });
        });
    }
}
navigator.serviceWorker.ready.then((registration) => {
    registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey), // Use your actual VAPID public key
    })
    .then((subscription) => {
        console.log('Push subscription successful:', subscription);

        // Send subscription to the server
        fetch('/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription),
        })
        .then((response) => response.json())
        .then((data) => {
            console.log('Server response:', data);
        })
        .catch((error) => {
            console.error('Failed to send subscription to server:', error);
        });
    })
    .catch((error) => {
        console.error('Push subscription failed:', error);
    });
});

// Utility: Convert VAPID key to correct format
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}
