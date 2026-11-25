function buildWeatherUrl(latitude, longitude) {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(latitude));
    url.searchParams.set('longitude', String(longitude));
    url.searchParams.set(
        'daily',
        'temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,snowfall_sum',
    );
    url.searchParams.set('forecast_days', '7');
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

export default function createWeatherService(fetchImplementation = globalThis.fetch) {
    return {
        getWeather: async ({ latitude, longitude }) => {
            const url = buildWeatherUrl(latitude, longitude);
            const response = await fetchImplementation(url.toString());
            if (!response.ok) {
                throw new Error(`Open-Meteo request failed with status ${response.status}`);
            }

            const forecast = await response.json();
            const daily = forecast.daily;
            if (!daily?.time) {
                throw new Error('Open-Meteo response has no daily forecast');
            }

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
        },
    };
}
