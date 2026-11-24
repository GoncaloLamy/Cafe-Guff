import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app.js';

describe('GET /api/weather', () => {
    it('responds with 200 and a daily forecast', async () => {
        const fakeFetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                daily: {
                    time: ["2026-11-24", "2026-11-25"],
                    temperature_2m_max: [5, 6],
                    temperature_2m_min: [1, 2],
                    precipitation_sum: [0, 2],
                    rain_sum: [0, 2],
                    snowfall_sum: [0, 0],
                },
            })
        });

        const testApp = createApp({ fetch: fakeFetch });
        const response = await request(testApp).get('/api/weather');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([
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
        ]);
    })

    it('responds with 500 when the forecast request fails', async () => {
        const fakeFetch = vi.fn().mockResolvedValueOnce({
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
})