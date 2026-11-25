import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app.js';

function createSuccessfulWeatherFetch() {
    return vi.fn()
        .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                current: {
                    temperature_2m: 3.4,
                    weather_code: 3,
                    wind_speed_10m: 5.2,
                    rain: 2.5,
                    wind_direction_10m: 90,
                    apparent_temperature: 5.2,
                    relative_humidity_2m: 80,
                },
                daily: {
                    time: [
                        '2026-11-24',
                        '2026-11-25',
                        '2026-11-26',
                        '2026-11-27',
                        '2026-11-28',
                        '2026-11-29',
                        '2026-11-30',
                    ],
                    temperature_2m_max: [5, 6, 4, 5, 7, 8, 6],
                    temperature_2m_min: [1, 2, 0, 1, 3, 4, 2],
                    precipitation_sum: [0, 2, 0, 0, 0, 0, 0],
                    rain_sum: [0, 2, 0, 0, 0, 0, 0],
                    snowfall_sum: [0, 0, 0, 0, 0, 0, 0],
                },
            }),
        })
        .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                current: {
                    us_aqi: 25,
                },
            }),
        });
}

describe('GET /api/weather', () => {
    it('responds with current weather and a daily forecast', async () => {
        const fakeFetch = createSuccessfulWeatherFetch();

        const testApp = createApp({ fetch: fakeFetch });
        const response = await request(testApp).get('/api/weather');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            current: {
                temperature: 3.4,
                weatherCode: 3,
            },
            windspeed: 5.2,
            rain: 2.5,
            winddirection: 'Ø',
            feelslike: 5.2,
            airquality: 25,
            humidity: 80,
            week: [
                {
                    date: '2026-11-24',
                    temperatureMin: 1,
                    temperatureMax: 5,
                    condition: 'clear',
                },
                {
                    date: '2026-11-25',
                    temperatureMin: 2,
                    temperatureMax: 6,
                    condition: 'rain',
                },
                {
                    date: '2026-11-26',
                    temperatureMin: 0,
                    temperatureMax: 4,
                    condition: 'clear',
                },
                {
                    date: '2026-11-27',
                    temperatureMin: 1,
                    temperatureMax: 5,
                    condition: 'clear',
                },
                {
                    date: '2026-11-28',
                    temperatureMin: 3,
                    temperatureMax: 7,
                    condition: 'clear',
                },
                {
                    date: '2026-11-29',
                    temperatureMin: 4,
                    temperatureMax: 8,
                    condition: 'clear',
                },
                {
                    date: '2026-11-30',
                    temperatureMin: 2,
                    temperatureMax: 6,
                    condition: 'clear',
                },
            ],
        });

        const forecastUrl = new URL(fakeFetch.mock.calls[0][0]);
        expect(forecastUrl.searchParams.get('current')).toContain('apparent_temperature');
        expect(forecastUrl.searchParams.get('current')).toContain('weather_code');
        expect(forecastUrl.searchParams.get('wind_speed_unit')).toBe('ms');
        expect(fakeFetch).toHaveBeenCalledTimes(2);
    });

    it('responds with 500 when the forecast request fails', async () => {
        const fakeFetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => ({ reason: 'Request failed' }),
        });

        const testApp = createApp({ fetch: fakeFetch });
        const response = await request(testApp).get('/api/weather');

        expect(response.status).toBe(500);
    })

    it('responds with 400 for invalid coordinates', async () => {
        const fakeFetch = vi.fn();
        const testApp = createApp({ fetch: fakeFetch });
        const response = await request(testApp).get('/api/weather?latitude=not-a-number&longitude=12.5439');

        expect(response.status).toBe(400);
        expect(fakeFetch).not.toHaveBeenCalled();
    });
});

describe('Weather Frontend-testing', () => {
    let body;

    const fakeFetch = createSuccessfulWeatherFetch();

    beforeAll(async () => {
        const testApp = createApp({ fetch: fakeFetch });
        const response = await request(testApp).get('/api/weather');
        body = response.body;
    });

    it('/weather findes ', async () => {
        const testApp = createApp({ fetch: fakeFetch });
        const response = await request(testApp).get('/weather');

        expect(response.status).toBe(200);
    });

    it('vejrsymbol er et link', async () => {
        const testApp = createApp({ fetch: fakeFetch });
        const response = await request(testApp).get('/');

        expect(response.status).toBe(200);
        expect(response.text).toMatch(/<a[^>]*href="\/weather"[^>]*>/);
        expect(response.text).toContain('id="weather-condition"');
        expect(response.text).toContain('id="weather-temperature"');
        expect(response.text).toContain('src="/js/app.js"');

        const scriptResponse = await request(testApp).get('/js/app.js');
        expect(scriptResponse.status).toBe(200);
    });

    it('vejrsymbol fører til gyldig side', async () => {
        const testApp = createApp({ fetch: fakeFetch });

        const homeResponse = await request(testApp).get('/');
        expect(homeResponse.status).toBe(200);

        const match = homeResponse.text.match(/<a[^>]*href="\/weather"[^>]*>/);
        expect(match).not.toBeNull();

        const targetResponse = await request(testApp).get('/weather');
        expect(targetResponse.status).toBe(200);
        expect(targetResponse.text).toContain('Vejr udsigt');
    });

    it('giver 404 hvis en side ikke findes', async () => {
        const testApp = createApp();
        const response = await request(testApp).get('/this-page-does-not-exist');

        expect(response.status).toBe(404);
    });

    it('weather page contains all detailed weather fields', async () => {
        const testApp = createApp();
        const response = await request(testApp).get('/weather');

        expect(response.text).toContain('id="wind-speed"');
        expect(response.text).toContain('id="rain"');
        expect(response.text).toContain('id="wind-direction"');
        expect(response.text).toContain('id="feels-like"');
        expect(response.text).toContain('id="air-quality"');
        expect(response.text).toContain('id="humidity"');
        expect(response.text).toContain('id="weekly-forecast"');
        expect(response.text).toContain('src="/js/weather.js"');

        const scriptResponse = await request(testApp).get('/js/weather.js');
        expect(scriptResponse.status).toBe(200);
    });

    it('weather API contains current conditions and the seven-day forecast', async () => {
        expect(body.current).toEqual({ temperature: 3.4, weatherCode: 3 });
        expect(body.windspeed).toBe(5.2);
        expect(body.rain).toBe(2.5);
        expect(body.winddirection).toBe('Ø');
        expect(body.feelslike).toBe(5.2);
        expect(body.week).toHaveLength(7);
        expect(body.week[0]).toMatchObject({
            date: '2026-11-24',
            temperatureMin: 1,
            temperatureMax: 5,
            condition: 'clear',
        });
        expect(body.airquality).toBe(25);
        expect(body.humidity).toBe(80);
    });

    it('when air quality is missing the api should still show weather', async () => {
        const fakeFetch = vi.fn()
        .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                current: {
                    temperature_2m: 3.4,
                    weather_code: 3,
                    wind_speed_10m: 5.2,
                    rain: 2.5,
                    wind_direction_10m: 90,
                    apparent_temperature: 5.2,
                    relative_humidity_2m: 80,
                },
                daily: {
                    time: [
                        '2026-11-24',
                        '2026-11-25',
                        '2026-11-26',
                        '2026-11-27',
                        '2026-11-28',
                        '2026-11-29',
                        '2026-11-30',
                    ],
                    temperature_2m_max: [5, 6, 4, 5, 7, 8, 6],
                    temperature_2m_min: [1, 2, 0, 1, 3, 4, 2],
                    precipitation_sum: [0, 2, 0, 0, 0, 0, 0],
                    rain_sum: [0, 2, 0, 0, 0, 0, 0],
                    snowfall_sum: [0, 0, 0, 0, 0, 0, 0],
                },
            }),
        })
        .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                current: {
                },
            }),
        });

        const testApp = createApp({ fetch: fakeFetch });

        const response = await request(testApp).get('/api/weather');
        const body = response.body;

        expect(body.current).toEqual({ temperature: 3.4, weatherCode: 3 });
        expect(body.windspeed).toBe(5.2);
        expect(body.rain).toBe(2.5);
        expect(body.winddirection).toBe('Ø');
        expect(body.feelslike).toBe(5.2);
        expect(body.week).toHaveLength(7);
        expect(body.week[0]).toMatchObject({
            date: '2026-11-24',
            temperatureMin: 1,
            temperatureMax: 5,
            condition: 'clear',
        });
        expect(body.airquality).toBeUndefined();
        expect(body.humidity).toBe(80);
        expect(response.status).toBe(200);
    })

    it('should return a 500 error when the weather API returns an error, but still show weather data', async () => {
        const fakeFetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                current: {
                    temperature_2m: 3.4,
                    weather_code: 3,
                    wind_speed_10m: 5.2,
                    rain: 2.5,
                    wind_direction_10m: 90,
                    apparent_temperature: 5.2,
                    relative_humidity_2m: 80,
                },
                daily: {
                    time: [
                        '2026-11-24',
                        '2026-11-25',
                        '2026-11-26',
                        '2026-11-27',
                        '2026-11-28',
                        '2026-11-29',
                        '2026-11-30',
                    ],
                    temperature_2m_max: [5, 6, 4, 5, 7, 8, 6],
                    temperature_2m_min: [1, 2, 0, 1, 3, 4, 2],
                    precipitation_sum: [0, 2, 0, 0, 0, 0, 0],
                    rain_sum: [0, 2, 0, 0, 0, 0, 0],
                    snowfall_sum: [0, 0, 0, 0, 0, 0, 0],
                },
            }),
        })
        .mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        const testApp = createApp({ fetch: fakeFetch });
        const response = await request(testApp).get('/api/weather');

        expect(response.status).toBe(200);
        expect(response.body.current).toEqual({ temperature: 3.4, weatherCode: 3 });
        expect(response.body.airquality).toBeUndefined();
    })
});