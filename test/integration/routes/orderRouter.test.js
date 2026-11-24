import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app, { createApp } from '../../../src/app.js';


describe('Bestilling', () => {
    // Acceptkriterie 1
    it('en tjener kan se menuen', async () => {
        const response = await request(app).get('/api/menu');

        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('price');
        expect(response.body[0]).toHaveProperty('allergies');
    });
// Acceptkriterie 2
    it('en tjener kan oprette en bestilling', async () => {
        const response = await request(app)
            .post('/api/orders')
            .send({
                table: 5,
                dishIds: [1, 2]
            });

        expect(response.status).toBe(201);
        expect(response.body.table).toBe(5);
        expect(response.body.dishIds).toHaveLength(2);
    });
});

describe('Story 14, remove dish from order', () => {
    it('patchOrder_removeDish_returnsOrderWithoutDish', async () => {
        // Arrange
        const app = createApp();
        const created = await request(app)
            .post('/api/orders')
            .send({ table: 1, dishIds: [1, 2] });

        // Act
        const response = await request(app)
            .patch(`/api/orders/${created.body.id}`)
            .send({ dishIds: [1] });

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.dishIds).toEqual(['1']);
    });

    it('patchOrder_removeDish_updatesTotalFromMenu', async () => {
        // Arrange
        const app = createApp();
        const created = await request(app)
            .post('/api/orders')
            .send({ table: 2, dishIds: [1, 2] });

        // Act
        const response = await request(app)
            .patch(`/api/orders/${created.body.id}`)
            .send({ dishIds: [1] });

        // Assert
        expect(response.body.total).toBe(65);
    });

    it('patchOrder_invalidDishIds_returns400', async () => {
        // Arrange
        const app = createApp();
        const created = await request(app)
            .post('/api/orders')
            .send({ table: 3, dishIds: [1, 2] });

        // Act
        const response = await request(app)
            .patch(`/api/orders/${created.body.id}`)
            .send({ dishIds: [] });

        // Assert
        expect(response.status).toBe(400);
    });

    it('patchOrder_unknownOrder_returns404', async () => {
        // Arrange
        const app = createApp();

        // Act
        const response = await request(app)
            .patch('/api/orders/999')
            .send({ dishIds: [1] });

        // Assert
        expect(response.status).toBe(404);
    });

    it('patchOrder_unknownDish_returns404', async () => {
        // Arrange
        const app = createApp();
        const created = await request(app)
            .post('/api/orders')
            .send({ table: 4, dishIds: [1, 2] });

        // Act
        const response = await request(app)
            .patch(`/api/orders/${created.body.id}`)
            .send({ dishIds: [99] });

        // Assert
        expect(response.status).toBe(404);
    });
});

describe('Story 12, samlet prisangivelse', () => {
    it('createOrder_withDishes_returnsTotalFromMenu', async () => {
        // Arrange
        const app = createApp();

        // Act
        const response = await request(app)
            .post('/api/orders')
            .send({ table: 5, dishIds: [1, 2] });

        // Assert
        expect(response.status).toBe(201);
        expect(response.body.total).toBe(150);
    });

    it('createOrder_sameDishTwice_returnsPriceForBoth', async () => {
        // Arrange
        const app = createApp();

        // Act
        const response = await request(app)
            .post('/api/orders')
            .send({ table: 5, dishIds: [1, 1] });

        // Assert
        expect(response.status).toBe(201);
        expect(response.body.total).toBe(130);
    });
    it('patchOrder_addDish_updatesTotalFromMenu', async () => {
        // Arrange
        const app = createApp();
        const created = await request(app)
            .post('/api/orders')
            .send({ table: 5, dishIds: [1] });

        // Act
        const response = await request(app)
            .patch(`/api/orders/${created.body.id}`)
            .send({ dishIds: [1, 2] });

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.total).toBe(150);
    });
});

describe('Story 11, table number', () => {
    it('createOrder_withTable_returnsOrderWithTable', async () => {
        // Arrange
        const app = createApp();

        // Act
        const response = await request(app)
            .post('/api/orders')
            .send({ table: 5, dishIds: [1, 2] });

        // Assert
        expect(response.status).toBe(201);
        expect(response.body.table).toBe(5);
    });

    it('createOrder_withoutTable_returns400', async () => {
        // Arrange
        const app = createApp();

        // Act
        const response = await request(app)
            .post('/api/orders')
            .send({ dishIds: [1, 2] });

        // Assert
        expect(response.status).toBe(400);
    });

     it('createOrder_tableNegative_returns400', async () => {
        // Arrange
        const app = createApp();

        // Act
        const response = await request(app)
            .post('/api/orders')
            .send({ table: -99, dishIds: [1, 2] });

        // Assert
        expect(response.status).toBe(400);
    });

    it('createOrder_tableZero_returns400', async () => {
        // Arrange
        const app = createApp();

        // Act
        const response = await request(app)
            .post('/api/orders')
            .send({ table: 0, dishIds: [1, 2] });

        // Assert
        expect(response.status).toBe(400);
    });

    it('createOrder_withStringTable_returns400', async () => {
        // Arrange
        const app = createApp();

        // Act
        const response = await request(app)
        .post('/api/orders')
        .send({ table: 'abc', dishIds: [1, 2] });

        // Assert
        expect(response.status).toBe(400);
    });

    it('createOrder_tableDecimal_returns400', async () => {
        // Arrange
        const app = createApp();

        // Act
        const response = await request(app)
            .post('/api/orders')
            .send({ table: 1.5, dishIds: [1, 2] });

        // Assert
        expect(response.status).toBe(400);
    });
});
