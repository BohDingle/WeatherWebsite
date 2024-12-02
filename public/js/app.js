const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();

// Your OpenWeather API key (replace with your actual API key)
const apiKey = 'a3f21f5c9954e8a98b723c88b5d6832d'; // Replace with your OpenWeather API key
const city = 'Sydney'; // Replace with the city you want to query
const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`; // Add `&units=metric` to get temperature in Celsius

// Connect to your SQLite database
const db = new sqlite3.Database('database/database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Fetch weather data from OpenWeather API
axios.get(apiUrl)
    .then(response => {
        const { name: city, main: { temp }, weather } = response.data;
        const description = weather[0].description;

        // Insert the weather data into the 'weather' table
        const insertQuery = `
            INSERT INTO weather (city, temperature, description) 
            VALUES (?, ?, ?)
        `;
        db.run(insertQuery, [city, temp, description], function (err) {
            if (err) {
                console.error('Error inserting data:', err.message);
            } else {
                console.log(`Weather data for ${city} inserted into the database.`);
            }
        });
    })
    .catch(error => {
        console.error('Error fetching weather data:', error.message);
    })
    .finally(() => {
        // Close the database connection
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    });
