import request from 'supertest';
import { describe, it, expect, vi } from 'vitest';
import { createApp } from '../../src/app.js';

describe('Sikring af API', () => {
    it('health_ok_returns200', async () => {
        // Arrange
        const app = createApp();

        // Act
        const response = await request(app).get('/health');

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'ok' });
    });

    it('unknownRoute_requested_returns404', async () => {
        // Arrange
        const app = createApp();

        // Act
        const response = await request(app).get('/api/findes-ikke');

        // Assert
        expect(response.status).toBe(404);
    });

    it('createOrder_invalidJson_returns400', async () => {
        // Arrange
        const app = createApp();

        // Act
        const response = await request(app)
            .post('/api/orders')
            .set('Content-Type', 'application/json')
            .send('{ "table": ');

        // Assert
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid JSON' });
    });

    it('createOrder_bodyTooLarge_returns413', async () => {
        // Arrange
        const app = createApp();
        const largeBody = { table: 1, dishIds: [1], notes: ['x'.repeat(200000)] };

        // Act
        const response = await request(app).post('/api/orders').send(largeBody);

        // Assert
        expect(response.status).toBe(413);
    });

    it('createOrder_repositoryFails_returns500', async () => {
        // Arrange
        const failingRepository = {
            create: vi.fn().mockRejectedValue(new Error('database down')),
        };
        const app = createApp({ orderRepository: failingRepository });

        // Act
        const response = await request(app)
            .post('/api/orders')
            .send({ table: 3, dishIds: [1] });

        // Assert
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Internal server error' });
    });
});