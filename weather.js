const express = require('express');
const axios = require('axios');
const { celsiusToFahrenheit } = require('./temperatureConverter');

const app = express();
const port = process.env.PORT || 8000;

const OPENWEATHER_API_KEY = '2745c06fd02ddb53d569e790860a7ed8 ';
const OPENWEATHER_BASE_URL = 'http://api.openweathermap.org/data/2.5/weather';
const KELVIN_TO_CELSIUS = 273; // Conversion from Kelvin to Celsius

function getWeatherCondition(latitude, longitude) {
    const url = `${OPENWEATHER_BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}`;
    return axios.get(url)
        .then(response => {
            const data = response.data;
            const weatherDescription = data.weather[0].description;
            const temperatureKelvin = data.main.temp;
            const temperatureCelsius = temperatureKelvin - KELVIN_TO_CELSIUS; // Convert temperature to Celsius
            const temperatureFahrenheit = celsiusToFahrenheit(temperatureCelsius); // Convert temperature to Fahrenheit
            const condition = classifyWeather(temperatureCelsius, weatherDescription);
            return { condition, temperatureCelsius, temperatureFahrenheit };
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            throw new Error('Error fetching weather data');
        });
}

function classifyWeather(temperature, description) {
    const weatherConditions = ['rain', 'drizzle', 'snow'];  // Array of weather conditions
    const lowerCaseDescription = description.toLowerCase();

    const isWeatherConditionPresent = weatherConditions.some(condition => lowerCaseDescription.includes(condition));

    if (isWeatherConditionPresent) {
        return 'Rainy';
    } else if (temperature > 25) {
        return 'Hot';
    } else if (temperature < 10) {
        return 'Cold';
    } else {
        return 'Moderate';
    }
}

app.get('/weather', (req, res) => {
    const latitude = req.query.lat;
    const longitude = req.query.long;

    if (!isValidCoordinate(latitude) || !isValidCoordinate(longitude)) {
        return res.status(400).json({ error: 'Invalid latitude or longitude parameters' });
    }

    getWeatherCondition(latitude, longitude)
        .then(({ condition, temperatureCelsius, temperatureFahrenheit }) => {
            res.json({ condition, temperatureCelsius, temperatureFahrenheit });
        })
        .catch(error => {
            res.status(500).json({ error: 'Error fetching weather data' });
        });
});

function isValidCoordinate(coordinate) {
    const regex = /^-?\d+(\.\d+)?$/;
    return regex.test(coordinate);
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
