const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Connect to SQLite database
const db = new sqlite3.Database('./data_source.db');

// Define the API endpoint
app.get('/weather', (req, res) => {
    const city = req.query.city;

    if (!city) {
        return res.status(400).json({ error: 'City is required' });
    }

    db.get('SELECT * FROM weather_logs WHERE city = ?', [city], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
            return res.status(404).json({ error: 'City not found' });
        }

        res.json({
            city: row.city,
            weather: row.weather,
            temperature: row.temperature,
            timestamp: row.timestamp,
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
