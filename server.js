const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const cron = require('node-cron');
const path = require('path');
const webPush = require('web-push'); // Import the web-push library
const app = express();
const PORT = 3000;

const apiKey = '07fde61765004f66ba2fb649aa9e1fc7';
const dbPath = path.join(__dirname, 'database.db');


// Use the keys you generated
const vapidPublicKey = 'BMSLuANQ16X2iUAsYb5tYiiKf68Ef7zIPlo3fbotVTfyl0ts4-qo5xhuDgrT4-WaoX5-Dbnxy1vLwKUVVfVS_6U';
const vapidPrivateKey = 'r87vm9wCUgV0yrVivmOna0A3nrULVhRV3fGGCdqNkyg';

// Set VAPID details
webPush.setVapidDetails(
  'mailto:liuk6596@gmail.com', // Replace with your email
  vapidPublicKey,
  vapidPrivateKey
);


const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database at', dbPath);
    }
});

// Create table for storing weather logs
db.run(
    `CREATE TABLE IF NOT EXISTS weather_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        city TEXT,
        weather TEXT,
        temperature REAL,
        date TEXT UNIQUE
    )`
);

const pushSubscriptions = []; // Store push subscriptions

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

// API to get weather data
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

// API for handling subscription
app.post('/subscribe', express.json(), (req, res) => {
    const subscription = req.body;

    // Store subscription in the pushSubscriptions array
    pushSubscriptions.push(subscription);

    res.status(201).json({ message: 'Subscription added successfully' });
});

// Send push notifications to all subscribers
function sendPushNotification() {
    pushSubscriptions.forEach((subscription) => {
        const payload = JSON.stringify({
            title: 'Weather Update',
            body: 'New weather data is available!',
        });

        webPush.sendNotification(subscription, payload).catch((err) => {
            console.error('Error sending notification:', err);
        });
    });
}

// Example trigger to send push notification (can be done based on weather data updates)
cron.schedule('* * * * *', sendPushNotification); // Send notifications daily at 9 AM

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
