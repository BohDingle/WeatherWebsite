async function fetchWeatherLogs() {
    try {
        const response = await fetch('/api/weather'); // Calls the correct backend API
        const logs = await response.json();

        const logsList = document.getElementById('logs-list');
        logsList.innerHTML = ''; // Clear any existing logs

        if (logs.length === 0) {
            logsList.innerHTML = `<tr><td colspan="4">No weather logs available.</td></tr>`;
        } else {
            logs.forEach(log => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${log.city}</td>
                    <td>${log.weather}</td>
                    <td>${log.temperature}°C</td>
                    <td>${new Date(log.timestamp).toLocaleString()}</td>
                `;
                logsList.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error fetching logs:', error.message);
        document.getElementById('logs-list').innerHTML = `<tr><td colspan="4">Error fetching logs</td></tr>`;
    }
}

// Fetch logs when the page is loaded
document.addEventListener('DOMContentLoaded', fetchWeatherLogs);
