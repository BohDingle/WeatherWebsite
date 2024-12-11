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

// Function to map weather descriptions to image paths
function getWeatherImage(description) {
    if (description.includes('rain')) return '/icons/rainy.png';
    if (description.includes('scattered')) return '/icons/cloudwsun.png';
    if (description.includes('clear')) return '/icons/sunny.png';
    if (description.includes('sunny')) return '/icons/sunny.png';
    if (description.includes('overcast')) return '/icons/cloudy.png';
    return '/images/default.png'; // Fallback image
}

// Register service worker and subscribe to push notifications
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


// Utility function to convert the VAPID key to the correct format
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
