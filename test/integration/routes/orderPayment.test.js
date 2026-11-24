import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createApp } from '../../../src/app.js';

describe('Story 13, order payment', () => {
    it('closeOrder_activeOrder_marksOrderAsPaid', async () => {
        // Arrange
        const app = createApp();
        const created = await request(app)
            .post('/api/orders')
            .send({ table: 5, dishIds: [1] });

        // Act
        const response = await request(app)
            .post(`/api/orders/${created.body.id}/close`);

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.paid).toBe(true);
    });

    it('closeOrder_unknownOrder_returns404', async () => {
        // Arrange
        const app = createApp();

        // Act
        const response = await request(app)
            .patch('/api/orders/999/close');

        // Assert
        expect(response.status).toBe(404)
    });

    it('closeOrder_alreadyClosed_returns409', async () => {
        // Arrange
        const app = createApp();

        const created = await request(app)
        .post('/api/orders')
        .send({ table: 1, dishIds: [1, 2] });


        await request(app)
        .patch(`/api/orders/${created.body.id}/close`);

        // Act
        const response = await request(app)
        .patch(`/api/orders/${created.body.id}/close`);

        // Assert
        expect(response.status).toBe(409);


    });

    it('patchOrder_closedOrder_returns409', async () => {
        // Arrange
        const app = createApp();
        const created = await request(app)
        .post('/api/orders')
        .send({ table: 1, dishIds: [1, 2] });

        await request(app)
        .patch(`/api/orders/${created.body.id}/close`);

        // Act
        const response = await request(app)
            .patch (`/api/orders/${created.body.id}`)
            .send({ dishIds: [1] });

        // Assert
        expect(response.status).toBe(409);
    });

    it('createOrder_newOrder_isNotPaid', async () => {
        // Arrange
        const app = createApp();

        // Act
        const response = await request(app)
        .post('/api/orders')
        .send({
            table: 1,
            dishIds: [1, 2]
        });

        // Assert
        expect(response.status).toBe(201)
        expect(response.body.isPaid).toBe(false)
    });
});
