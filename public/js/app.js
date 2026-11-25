const weatherConditions = {
    0: { icon: '☀️', label: 'Solrigt' },
    1: { icon: '🌤️', label: 'Mest sol' },
    2: { icon: '⛅', label: 'Delvist skyet' },
    3: { icon: '☁️', label: 'Overskyet' },
    45: { icon: '🌫️', label: 'Tåge' },
    48: { icon: '🌫️', label: 'Tåge' },
    51: { icon: '🌦️', label: 'Støvregn' },
    53: { icon: '🌦️', label: 'Støvregn' },
    55: { icon: '🌦️', label: 'Støvregn' },
    56: { icon: '🌦️', label: 'Støvregn' },
    57: { icon: '🌦️', label: 'Støvregn' },
    61: { icon: '🌧️', label: 'Regn' },
    63: { icon: '🌧️', label: 'Regn' },
    65: { icon: '🌧️', label: 'Regn' },
    66: { icon: '🌧️', label: 'Regn' },
    67: { icon: '🌧️', label: 'Regn' },
    71: { icon: '🌨️', label: 'Sne' },
    73: { icon: '🌨️', label: 'Sne' },
    75: { icon: '🌨️', label: 'Sne' },
    77: { icon: '🌨️', label: 'Sne' },
    80: { icon: '🌧️', label: 'Regn' },
    81: { icon: '🌧️', label: 'Regn' },
    82: { icon: '🌧️', label: 'Regn' },
    85: { icon: '🌨️', label: 'Sne' },
    86: { icon: '🌨️', label: 'Sne' },
    95: { icon: '⛈️', label: 'Tordenvejr' },
    96: { icon: '⛈️', label: 'Tordenvejr' },
    99: { icon: '⛈️', label: 'Tordenvejr' },
};

function getWeatherCondition(code) {
    return weatherConditions[code] || { icon: '🌡️', label: 'Vejret' };
}

function renderCurrentWeather(current) {
    const condition = getWeatherCondition(current.weatherCode);
    const link = document.getElementById('weather-link');

    document.getElementById('weather-icon').textContent = condition.icon;
    document.getElementById('weather-condition').textContent = condition.label;
    document.getElementById('weather-temperature').textContent = `${current.temperature} °C`;
    link.setAttribute(
        'aria-label',
        `${condition.label}, ${current.temperature} grader. Se detaljeret vejrudsigt`,
    );
}

async function loadCurrentWeather() {
    const errorMessage = document.getElementById('weather-error');
    try {
        const response = await fetch('/api/weather');
        if (!response.ok) {
            throw new Error('Weather request failed');
        }

        const weather = await response.json();
        renderCurrentWeather(weather.current);
    } catch {
        errorMessage.textContent = 'Vejret kunne ikke hentes lige nu.';
        errorMessage.hidden = false;
    }
}

loadCurrentWeather();
