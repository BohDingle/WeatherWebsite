// Fetch weather data from the server and populate the cards
async function fetchWeatherLogs() {
    try {
        const response = await fetch('/api/weather'); // Fetch data from the API
        const weatherLogs = await response.json();

        const container = document.getElementById('weather-container');
        container.innerHTML = ''; // Clear previous content

        // Iterate through weather logs and create cards
        weatherLogs.forEach((log) => {
            const card = document.createElement('div');
            card.className = 'weather-card';

            // Format the timestamp
            const date = new Date(log.timestamp);
            const formattedDate = date.toLocaleDateString();
            const formattedDay = date.toLocaleDateString('en-US', { weekday: 'long' });

            // Weather icon logic based on description
            const weatherIcon = getWeatherIconClass(log.weather);

            card.innerHTML = `
                <h2>${formattedDate}</h2>
                <h3>${formattedDay}, ${log.city}</h3>
                <div class="weather-icon ${weatherIcon}"></div>
                <p>${log.temperature}°C</p>
                <p>${log.weather}</p>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching weather logs:', error);
    }
}

// Function to map weather descriptions to icon classes
function getWeatherIconClass(description) {
    if (description.includes('rain')) {
        return 'rainy';
    } else if (description.includes('cloud')) {
        return 'cloudy';
    } else if (description.includes('sun')) {
        return 'sunny';
    } else {
        return 'default-icon'; // Fallback icon
    }
}

// Call the function on page load
fetchWeatherLogs();
