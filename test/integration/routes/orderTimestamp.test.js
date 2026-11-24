import request from 'supertest';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { createApp } from '../../../src/app.js';

describe('Story 20, tidsstempel', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('createOrder_newOrder_returnsCreatedAt', async () => {
        // Arrange
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date('2026-01-15T12:30:00.000Z'));
        const app = createApp();

        // Act
        const response = await request(app)
            .post('/api/orders')
            .send({ table: 5, dishIds: [1, 2] });

        // Assert
        expect(response.status).toBe(201);
        expect(response.body.createdAt).toBe('2026-01-15T12:30:00.000Z');
    });

    it('patchOrder_changeDishes_keepsOriginalCreatedAt', async () => {
        // Arrange
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date('2026-01-15T12:30:00.000Z'));
        const app = createApp();
        const created = await request(app)
            .post('/api/orders')
            .send({ table: 5, dishIds: [1, 2] });

        // Act
        vi.setSystemTime(new Date('2026-01-15T13:45:00.000Z'));
        const response = await request(app)
            .patch(`/api/orders/${created.body.id}`)
            .send({ dishIds: [1] });

        // Assert
        expect(response.status).toBe(200);
        expect(created.body.createdAt).toBe('2026-01-15T12:30:00.000Z');
        expect(response.body.createdAt).toBe(created.body.createdAt);
    });

    it('createOrder_clientSendsCreatedAt_ignoresIt', async () => {
        // Arrange
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date('2026-01-15T12:30:00.000Z'));
        const app = createApp();

        // Act
        const response = await request(app)
            .post('/api/orders')
            .send({ table: 5, dishIds: [1], createdAt: '2000-01-01T00:00:00.000Z' });

        // Assert
        expect(response.status).toBe(201);
        expect(response.body.createdAt).toBe('2026-01-15T12:30:00.000Z');
    });
});