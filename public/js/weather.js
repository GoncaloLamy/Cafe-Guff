function setWeatherValue(id, value) {
    document.getElementById(id).textContent = String(value);
}

function getConditionLabel(condition) {
    if (condition === 'rain') {
        return 'Regn';
    }
    if (condition === 'snow') {
        return 'Sne';
    }
    return 'Klart';
}

function formatForecastDate(date) {
    return new Date(`${date}T12:00:00`).toLocaleDateString('da-DK', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });
}

function renderForecast(days) {
    const forecastList = document.getElementById('weekly-forecast');
    for (const day of days) {
        const item = document.createElement('li');
        const heading = document.createElement('h3');
        const details = document.createElement('p');

        heading.textContent = formatForecastDate(day.date);
        details.textContent = `${getConditionLabel(day.condition)}: ${day.temperatureMin}–${day.temperatureMax} °C`;
        item.append(heading, details);
        forecastList.append(item);
    }
}

async function loadWeather() {
    const errorMessage = document.getElementById('weather-error');
    let weather;
    try {
        const response = await fetch('/api/weather');
        if (!response.ok) {
            throw new Error('Weather request failed');
        }

        weather = await response.json();
    } catch {
        errorMessage.textContent = 'Vejret kunne ikke hentes. Prøv igen senere.';
        errorMessage.hidden = false;
        return;
    }

    setWeatherValue('wind-speed', weather.windspeed);
    setWeatherValue('rain', weather.rain);
    setWeatherValue('wind-direction', weather.winddirection);
    setWeatherValue('feels-like', weather.feelslike);
    setWeatherValue('air-quality', weather.airquality);
    setWeatherValue('humidity', weather.humidity);
    renderForecast(weather.week);
}

loadWeather();
