function buildWeatherUrl(latitude, longitude) {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(latitude));
    url.searchParams.set('longitude', String(longitude));
    url.searchParams.set(
        'current',
        'temperature_2m,relative_humidity_2m,apparent_temperature,rain,weather_code,wind_speed_10m,wind_direction_10m',
    );
    url.searchParams.set(
        'daily',
        'temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,snowfall_sum',
    );
    url.searchParams.set('forecast_days', '7');
    url.searchParams.set('timezone', 'Europe/Copenhagen');
    url.searchParams.set('wind_speed_unit', 'ms');
    return url;
}

function buildAirQualityUrl(latitude, longitude) {
    const url = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
    url.searchParams.set('latitude', String(latitude));
    url.searchParams.set('longitude', String(longitude));
    url.searchParams.set('current', 'us_aqi');
    url.searchParams.set('timezone', 'Europe/Copenhagen');
    return url;
}

function getCondition(snowfall, rain, precipitation) {
    if (Number(snowfall) > 0) {
        return 'snow';
    }
    if (Number(rain) > 0 || Number(precipitation) > 0) {
        return 'rain';
    }
    return 'clear';
}

function getWindDirection(degrees) {
    const directions = ['N', 'NØ', 'Ø', 'SØ', 'S', 'SV', 'V', 'NV'];
    const bearing = Number(degrees);
    if (!Number.isFinite(bearing)) {
        throw new Error('Open-Meteo response has no wind direction');
    }

    return directions[Math.round(((bearing % 360) + 360) % 360 / 45) % directions.length];
}

async function fetchWeatherData(latitude, longitude, fetchImplementation) {
    const [weatherResponse, airQualityResponse] = await Promise.all([
        fetchImplementation(buildWeatherUrl(latitude, longitude).toString()),
        fetchImplementation(buildAirQualityUrl(latitude, longitude).toString()),
    ]);
    if (!weatherResponse.ok) {
        throw new Error(`Open-Meteo weather request failed with status ${weatherResponse.status}`);
    }
    if (!airQualityResponse.ok) {
        throw new Error(`Open-Meteo air quality request failed with status ${airQualityResponse.status}`);
    }

    return Promise.all([weatherResponse.json(), airQualityResponse.json()]);
}

function mapForecast(daily) {
    return daily.time.map((date, index) => ({
        date,
        temperatureMin: daily.temperature_2m_min[index],
        temperatureMax: daily.temperature_2m_max[index],
        condition: getCondition(
            daily.snowfall_sum[index],
            daily.rain_sum[index],
            daily.precipitation_sum[index],
        ),
    }));
}

function mapWeatherData(forecast, airQuality) {
    const current = forecast.current;
    const daily = forecast.daily;
    const airQualityIndex = airQuality.current?.us_aqi;
    if (!current || !daily?.time) {
        throw new Error('Open-Meteo response has incomplete weather data');
    }

    return {
        current: {
            temperature: current.temperature_2m,
            weatherCode: current.weather_code,
        },
        windspeed: current.wind_speed_10m,
        rain: current.rain,
        winddirection: getWindDirection(current.wind_direction_10m),
        feelslike: current.apparent_temperature,
        airquality: airQualityIndex,
        humidity: current.relative_humidity_2m,
        week: mapForecast(daily),
    };
}

export default function createWeatherService(fetchImplementation = globalThis.fetch) {
    return {
        getWeather: async ({ latitude, longitude }) => {
            const [forecast, airQuality] = await fetchWeatherData(
                latitude,
                longitude,
                fetchImplementation,
            );
            return mapWeatherData(forecast, airQuality);
        },
    };
}
