const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const cron = require('node-cron');
const path = require('path');
const app = express();
const PORT = 3000;

const apiKey = '07fde61765004f66ba2fb649aa9e1fc7';
const dbPath = path.join(__dirname, 'database.db');

// SQLite connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database at', dbPath);
    }
});
// Create table
db.run(
    `CREATE TABLE IF NOT EXISTS weather_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        city TEXT,
        weather TEXT,
        temperature REAL,
        date TEXT UNIQUE
    )`  
);
const webPush = require('web-push');


// Fetch and store weather data
async function fetchWeatherData() {
    const city = 'Sydney';
    const lat = -33.8688;
    const lon = 151.2093;
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    try {
        const response = await axios.get(apiUrl);
        const { list } = response.data;
        const dailyForecast = {};

        list.forEach((entry) => {
            const date = new Date(entry.dt * 1000).toISOString().split('T')[0];
            if (!dailyForecast[date]) {
                dailyForecast[date] = {
                    temp: entry.main.temp,
                    description: entry.weather[0].description,
                };
            }
        });

        Object.keys(dailyForecast).forEach((date) => {
            const { temp, description } = dailyForecast[date];
            db.run(
                `INSERT OR IGNORE INTO weather_logs (city, weather, temperature, date) VALUES (?, ?, ?, ?)`,
                [city, description, temp, date],
                (err) => {
                    if (err) console.error('Error inserting data:', err.message);
                    else console.log(`Inserted data for ${date}`);
                }
            );
        });

        console.log('Weather data saved to database.');
    } catch (error) {
        console.error('Error fetching weather data:', error.response?.data || error.message);
    }
}

// Schedule cron job
cron.schedule('0 9 * * *', fetchWeatherData); // Run at 9 AM daily

// Serve data API
app.get('/api/weather', (req, res) => {
    db.all(
        `SELECT * FROM weather_logs WHERE date >= DATE('now') ORDER BY date ASC`,
        [],
        (err, rows) => {
            if (err) {
                console.error('Error retrieving data:', err.message);
                res.status(500).json({ error: 'Failed to retrieve data' });
            } else {
                res.json(rows);
            }
        }
    );
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
