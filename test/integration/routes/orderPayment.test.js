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
            .post('/api/orders/999/close');

        // Assert
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Order not found');
    });

    it('closeOrder_alreadyClosed_returns409', async () => {
        // Arrange
        const app = createApp();
        const created = await request(app)
            .post('/api/orders')
            .send({ table: 1, dishIds: [1, 2] });
        await request(app)
            .post(`/api/orders/${created.body.id}/close`);

        // Act
        const response = await request(app)
            .post(`/api/orders/${created.body.id}/close`);

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
            .post(`/api/orders/${created.body.id}/close`);

        // Act
        const response = await request(app)
            .patch(`/api/orders/${created.body.id}`)
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
            .send({ table: 1, dishIds: [1, 2] });

        // Assert
        expect(response.status).toBe(201);
        expect(response.body.paid).toBe(false);
    });
});

describe('Story 16, split bill', () => {
    it('splitOrder_byDish_returnsSeparateBills', async () => {
        // Arrange
        const app = createApp();

        const order = await request(app)
            .post('/api/orders')
            .send({
                table: 3,
                dishIds: [1, 2]
            });

        // Act
        const response = await request(app)
            .post(`/api/orders/${order.body.id}/split`)
            .send({
                bills: [[1], [2]]
            });

        // Assert
        expect(response.status).toBe(201);
        expect(response.body.bills).toHaveLength(2);
    });
    it('splitOrder_eachBillHasCorrectPrice_returnsCorrectPrices', async () => {
        // Arrange
        const app = createApp();

        const order = await request(app)
            .post('/api/orders')
            .send({
                table: 3,
                dishIds: [1, 2]
            });

        // Act
        const response = await request(app)
            .post(`/api/orders/${order.body.id}/split`)
            .send({
                bills: [[1], [2]]
            });

        // Assert
        expect(response.status).toBe(201);
        expect(response.body.bills[0].price).toBe(65);
        expect(response.body.bills[1].price).toBe(85);
    });
    it('splitOrder_allBillsRemainAtSameTable_returnsSameTable', async () => {
        // Arrange
        const app = createApp();

        const order = await request(app)
            .post('/api/orders')
            .send({
                table: 3,
                dishIds: [1, 2]
            });

        // Act
        const response = await request(app)
            .post(`/api/orders/${order.body.id}/split`)
            .send({
                bills: [[1], [2]]
            });

        // Assert
        expect(response.status).toBe(201);
        expect(response.body.bills[0].table).toBe(3);
        expect(response.body.bills[1].table).toBe(3);
    });

    it('splitOrder_dishNotInOrder_returns400', async () => {
        // Arrange
        const app = createApp();

        const order = await request(app)
            .post('/api/orders')
            .send({table: 3, dishIds: [1, 2]});

        // Act
        const response = await request(app)
            .post(`/api/orders/${order.body.id}/split`)
            .send({bills: [[1], [2, 99]]});

        // Assert
        expect(response.status).toBe(400);
    });
    it('splitOrder_nonExistingOrder_returns404', async () => {
        // Arrange
        const app = createApp();

        // Act
        const response = await request(app)
            .post('/api/orders/9999/split')
            .send({ bills: [[1], [2]] });

        // Assert
        expect(response.status).toBe(404);
    });

    it('splitOrder_alreadySplitAndPartiallyPaidOrder_returns409', async () => {
        // Arrange
        const app = createApp();

        const order = await request(app)
            .post('/api/orders')
            .send({ table: 3, dishIds: [1, 2] });

        const split = await request(app)
            .post(`/api/orders/${order.body.id}/split`)
            .send({ bills: [[1], [2]] });

        const [firstBill, secondBill] = split.body.bills;

        // Pay only the first bill
        await request(app)
            .post(`/api/bills/${firstBill.id}/close`);

        // Act
        const response = await request(app)
            .post(`/api/orders/${order.body.id}/split`)
            .send({ bills: [[1], [2]] });

        // Assert
        expect(response.status).toBe(409);
        expect(response.body.error).toBe('Order already split');

        // The second bill must still be unpaid
        const bills = await request(app)
            .get(`/api/orders/${order.body.id}/bills`);

        const unpaid = bills.body.find((b) => b.id === secondBill.id);
        expect(unpaid.paid).toBe(false);
    });

    it('closeBill_oneBill_doesNotCloseOtherBills', async () => {
        // Arrange
        const app = createApp();
        const order = await request(app)
            .post('/api/orders')
            .send({ table: 3, dishIds: [1, 2] });
        const split = await request(app)
            .post(`/api/orders/${order.body.id}/split`)
            .send({ bills: [[1], [2]] });

        // Act
        const firstResponse = await request(app)
            .post(`/api/bills/${split.body.bills[0].id}/close`);
        const secondResponse = await request(app)
            .post(`/api/bills/${split.body.bills[1].id}/close`);

        // Assert
        expect(firstResponse.status).toBe(200);
        expect(firstResponse.body.paid).toBe(true);
        expect(secondResponse.status).toBe(200);
        expect(secondResponse.body.paid).toBe(true);
    });

    it('closeBill_unknownOrPaidBill_returns404', async () => {
        // Arrange
        const app = createApp();
        const order = await request(app)
            .post('/api/orders')
            .send({ table: 3, dishIds: [1, 2] });
        const split = await request(app)
            .post(`/api/orders/${order.body.id}/split`)
            .send({ bills: [[1], [2]] });

        // Act
        const missingResponse = await request(app)
            .post('/api/bills/9999/close');
        await request(app)
            .post(`/api/bills/${split.body.bills[0].id}/close`);

        // Assert
        expect(missingResponse.status).toBe(404);
    });
    it('closeBill_alreadyPaidBill_returns409', async () => {
        // Arrange
        const app = createApp();

        const order = await request(app)
            .post('/api/orders')
            .send({ table: 3, dishIds: [1, 2] });

        const split = await request(app)
            .post(`/api/orders/${order.body.id}/split`)
            .send({ bills: [[1], [2]] });

        const billId = split.body.bills[0].id;

        // Pay the bill once
        await request(app)
            .post(`/api/bills/${billId}/close`);

        // Act
        const response = await request(app)
            .post(`/api/bills/${billId}/close`);

        // Assert
        expect(response.status).toBe(409);
    });
})