import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createApp } from '../../../src/app.js';

describe('Story 6, note on dish', () => {
    it('createOrder_dishWithNote_returnsNoteOnThatDish', async () => {
        // Arrange
        const app = createApp();

        // Act
        const response = await request(app)
            .post('/api/orders')
            .send({ table: 3, dishIds: [1, 2], notes: ['no onions', ''] });

        // Assert
        expect(response.status).toBe(201);
        expect(response.body.notes).toEqual(['no onions', '']);
    });

    it('createOrder_dishWithoutNote_returnsEmptyNote', async () => {
        // Arrange
        const app = createApp();

        // Act
        const response = await request(app)
            .post('/api/orders')
            .send({table: 3, dishIds: [1, 2]});

        // Assert
        expect(response.status).toBe(201);
        expect(response.body.notes).toEqual(['', '']);
    });

    it('createOrder_sameDishTwiceWithDifferentNotes_keepsNotesSeparate', async () =>{
        // Arrange
        const app = createApp();

        // Act
        const response = await request(app).post('/api/orders').send({
            table: 3,
            dishIds: [1, 1],
            notes: ['no onions', 'extra cheese']
        });

        // Assert
        expect(response.status).toBe(201);
        expect(response.body.notes).toEqual([
        'no onions',
        'extra cheese'
    ]);
    });

    it('patchOrder_changeNote_returnsUpdatedNote',  async () =>  {
        // Arrange
        const app = createApp();

        const order = await request(app).post('/api/orders').send({
            table:3,
            dishIds: [1,2],
            notes: ['no onions', 'no pickles']
        })

        const orderId = order.body.id

        // Act
        const response = await request(app)
        .patch(`/api/orders/${orderId}`)
        .send({
            notes: ['', 'extra cheese']
        });

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.notes).toEqual(['', 'extra cheese'])
    });

    it('createOrder_notesLengthDiffersFromDishes_returns400',  async () => {
        // Arrange
        const app = createApp();

        // Act
        const response = await request(app).post('/api/orders').send({
            table: 3,
            dishIds: [1, 2],
            notes: ['no onions']
        });

        // Assert
        expect(response.status).toBe(400)
    });

    it('patchOrder_closedOrder_changeNote_returns409', async () => {
        // Arrange
        const app = createApp();
        const created = await request(app)
            .post('/api/orders')
            .send({ table: 3, dishIds: [1, 2], notes: ['no onions', ''] });
        await request(app).post(`/api/orders/${created.body.id}/close`);

        // Act
        const response = await request(app)
            .patch(`/api/orders/${created.body.id}`)
            .send({ notes: ['extra cheese', ''] });

        // Assert
        expect(response.status).toBe(409);
        expect(response.body.error).toBe('Order already paid');
    });
});