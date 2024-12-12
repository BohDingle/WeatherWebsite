const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const cron = require('node-cron');
const path = require('path');
const webPush = require('web-push');
const apicache = require('apicache');

const app = express();
const PORT = 3000;
const CACHE_DURATION = '5 minutes';
const API_KEY = '07fde61765004f66ba2fb649aa9e1fc7';
const DB_PATH = path.join(__dirname, 'database.db');
const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast`;
const CACHE = apicache.middleware;

// VAPID keys for push notifications
const VAPID_PUBLIC_KEY = 'BA5hCLGNy8sMVOWuI7qm3RNmD-Bj220NFiQq0s07W4MMy-yCBWV3J48VBgF4CjEosZPDOsvjMaPOG-blTeOp5E0';
const VAPID_PRIVATE_KEY = 'f9yMfjfYE-I0REf16-BoUN1zgCND26LlEIia63s-q2I';
webPush.setVapidDetails('mailto:liuk6596@gmail.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database');
        initDatabase();
    }
});

// Initialize database
function initDatabase() {
    db.run(
        `CREATE TABLE IF NOT EXISTS weather_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            city TEXT,
            weather TEXT,
            temperature REAL,
            date TEXT UNIQUE
        )`
    );
}

const pushSubscriptions = []; // In-memory storage for push subscriptions

// Fetch and store weather data
async function fetchWeatherData() {
    const city = 'Sydney';
    const params = {
        lat: -33.8688,
        lon: 151.2093,
        appid: API_KEY,
        units: 'metric',
    };

    try {
        const { data } = await axios.get(WEATHER_API_URL, { params });
        const dailyForecast = extractDailyForecast(data.list);

        db.serialize(() => {
            db.run(`DELETE FROM weather_logs`);
            const stmt = db.prepare(
                `INSERT INTO weather_logs (city, weather, temperature, date) VALUES (?, ?, ?, ?)`
            );

            Object.entries(dailyForecast).forEach(([date, { temp, description }]) => {
                stmt.run(city, description, temp, date);
            });

            stmt.finalize();
            console.log('Weather data updated in the database');
        });
    } catch (error) {
        console.error('Error fetching weather data:', error.response?.data || error.message);
    }
}

// Extract daily weather forecast from API response
function extractDailyForecast(data) {
    const dailyForecast = {};
    data.forEach((entry) => {
        const date = new Date(entry.dt * 1000).toISOString().split('T')[0];
        if (Object.keys(dailyForecast).length < 5 && !dailyForecast[date]) {
            dailyForecast[date] = {
                temp: entry.main.temp,
                description: entry.weather[0].description,
            };
        }
    });
    return dailyForecast;
}

// Send push notifications to subscribers
function sendPushNotifications() {
    if (pushSubscriptions.length === 0) {
        console.log('No subscriptions available');
        return;
    }

    pushSubscriptions.forEach((subscription, index) => {
        const payload = JSON.stringify({
            title: 'Weather Update',
            body: 'New weather data is available!',
        });

        webPush.sendNotification(subscription, payload)
            .then(() => {
                console.log(`Notification sent to subscriber ${index}`);
            })
            .catch((err) => {
                console.error('Error sending notification:', err);
            });
    });
}



// API: Fetch weather data from the database
app.get('/api/weather', CACHE(CACHE_DURATION), (req, res) => {
    const query = `SELECT * FROM weather_logs WHERE date >= DATE('now') ORDER BY date ASC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error retrieving weather data:', err.message);
            res.status(500).json({ error: 'Failed to retrieve data' });
        } else {
            res.json(rows);
        }
    });
});

// API: Save push subscriptions
app.post('/subscribe', express.json(), (req, res) => {
    const subscription = req.body;

    if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ error: 'Invalid subscription' });
    }

    pushSubscriptions.push(subscription);
    console.log('Subscription saved:', subscription);
    res.status(201).json({ message: 'Subscription added successfully' });
});

// Schedule tasks
cron.schedule('0 9 * * *', fetchWeatherData); // Fetch weather daily at 9 AM
cron.schedule('* * * * *', sendPushNotifications); // Send notifications daily at 10 AM

// Serve static files
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
