const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const app = express();
const PORT = 3000;

// Your OpenWeather API key
const apiKey = 'a3f21f5c9954e8a98b723c88b5d6832d';
const dbFile = 'database.db';

// SQLite database connection
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});


// Fetch and store weather data for a specific city
app.get('/fetch-weather', async (req, res) => {
    const city = req.query.city || 'Tokyo'; // Default city is Tokyo
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await axios.get(apiUrl);
        const { name, main: { temp }, weather } = response.data;
        const description = weather[0].description;

        // Save the weather data to the database
        db.run(
            `INSERT INTO weather_logs (city, weather, temperature) VALUES (?, ?, ?)`,
            [name, description, temp],
            function (err) {
                if (err) {
                    console.error('Error inserting data into database:', err.message);
                    res.status(500).json({ error: 'Failed to save data to database' });
                } else {
                    console.log('Weather data saved to database.');
                    res.json({
                        success: true,
                        message: 'Weather data fetched and saved successfully',
                        data: { city: name, weather: description, temperature: temp }
                    });
                }
            }
        );
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// Serve weather logs to the frontend
app.get('/api/weather', (req, res) => {
    db.all('SELECT * FROM weather_logs ORDER BY timestamp DESC LIMIT 10', [], (err, rows) => {
        if (err) {
            console.error('Error retrieving data from database:', err.message);
            res.status(500).json({ error: 'Failed to retrieve data' });
        } else {
            res.json(rows);
        }
    });
});

// Serve static frontend files
app.use(express.static('public'));

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
