document.addEventListener('DOMContentLoaded', async () => {
    const weatherContainer = document.getElementById('weather-container');

    try {
        const response = await fetch('/api/weather');
        const weatherLogs = await response.json();

        // Clear previous content
        weatherContainer.innerHTML = '';

        // Iterate through weather logs and create weather cards
        weatherLogs.forEach((log) => {
            const card = document.createElement('div');
            card.className = 'weather-card';

            // Format the date
            const date = new Date(log.date);
            const formattedDate = date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
            });
            const formattedDay = date.toLocaleDateString('en-US', {
                weekday: 'long',
            });

            // Determine the weather icon class
            const weatherIcon = getWeatherIconClass(log.weather);

            // Add content to the weather card
            card.innerHTML = `
                <h2>${formattedDate}</h2>
                <h3>${formattedDay}, ${log.city}</h3>
                <div class="weather-icon ${weatherIcon}"></div>
                <p>${log.temperature}°C</p>
                <p>${log.weather}</p>
            `;

            // Append the card to the container
            weatherContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching weather logs:', error);
    }
});

// Function to map weather descriptions to icon classes
function getWeatherIconClass(description) {
    if (description.toLowerCase().includes('rain')) {
        return 'rainy';
    } else if (description.toLowerCase().includes('cloud')) {
        return 'cloudy';
    } else if (description.toLowerCase().includes('sun')) {
        return 'sunny';
    } else {
        return 'default-icon'; // Fallback icon
    }
}
