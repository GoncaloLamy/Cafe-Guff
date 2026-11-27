import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createApp } from '../../../src/app.js';

const orderBody = { table: 3, dishIds: [1, 2], notes: ['no onions', ''] };

async function createOrder(app) {
    const created = await request(app).post('/api/orders/').send(orderBody);
    return created.body.id;
}

async function createSentOrder(app) {
    const orderId = await createOrder(app);
    await request(app).post(`/api/orders/${orderId}/send`);
    return orderId;
}

async function createReadyOrder(app) {
    const orderId = await createSentOrder(app);
    await request(app).post(`/api/kitchen/orders/${orderId}/ready`);
    return orderId;
}

describe('Story 9, Køkkenet', () => {
    it('sendOrder_newOrder_returns200AndStatusNew', async () => {
        // Arrange
        const app = createApp();
        const orderId = await createOrder(app);

        // Act
        const sendRes = await request(app).post(`/api/orders/${orderId}/send`);

        // Assert
        expect(sendRes.status).toBe(200);
        expect(sendRes.body.status).toBe('new');
    });

    it('getKitchenOrders_noOrdersSent_returnsEmptyList', async () => {
        // Arrange
        const app = createApp();

        // Act
        const res = await request(app).get('/api/kitchen/orders');

        // Assert
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('getKitchenOrders_afterOrderIsSent_listsTheOrder', async () => {
        // Arrange
        const app = createApp();
        const orderId = await createSentOrder(app);

        // Act
        const res = await request(app).get('/api/kitchen/orders');

        // Assert
        expect(res.body.map((order) => order.id)).toContain(orderId);
    });

    it('getKitchenOrders_orderCreatedButNotSent_doesNotListTheOrder', async () => {
        // Arrange
        const app = createApp();
        const orderId = await createOrder(app);

        // Act
        const res = await request(app).get('/api/kitchen/orders');

        // Assert
        expect(res.body.map((order) => order.id)).not.toContain(orderId);
    });

    it('sendOrder_orderAlreadySent_returns409', async () => {
        // Arrange
        const app = createApp();
        const orderId = await createSentOrder(app);

        // Act
        const res = await request(app).post(`/api/orders/${orderId}/send`);

        // Assert
        expect(res.status).toBe(409);
    });

    it('getKitchenOrders_twoOrdersSent_listsInTheOrderTheyWereSent', async () => {
        // Arrange
        const app = createApp();
        const firstId = await createOrder(app);
        const secondId = await createOrder(app);
        await request(app).post(`/api/orders/${secondId}/send`);
        await request(app).post(`/api/orders/${firstId}/send`);

        // Act
        const res = await request(app).get('/api/kitchen/orders');

        // Assert
        expect(res.body.map((order) => order.id)).toEqual([secondId, firstId]);
    });

    it('getKitchenOrders_afterOrderIsSent_includesTableAndNotes', async () => {
        // Arrange
        const app = createApp();
        const orderId = await createSentOrder(app);

        // Act
        const res = await request(app).get('/api/kitchen/orders');

        // Assert
        const kitchenOrder = res.body.find((order) => order.id === orderId);
        expect(kitchenOrder.table).toBe(3);
        expect(kitchenOrder.notes).toContain('no onions');
    });

    it('getKitchenOrders_afterOrderIsSent_orderHasStatusNew', async () => {
        // Arrange
        const app = createApp();
        const orderId = await createSentOrder(app);

        // Act
        const res = await request(app).get('/api/kitchen/orders');

        // Assert
        const kitchenOrder = res.body.find((order) => order.id === orderId);
        expect(kitchenOrder.status).toBe('new');
    });

    it('sendOrder_unknownOrder_returns404', async () => {
        // Arrange
        const app = createApp();

        // Act
        const res = await request(app).post('/api/orders/999/send');

        // Assert
        expect(res.status).toBe(404);
    });
});
describe("Story 10, Status on order", () => {
    it('startOrder_sentOrder_returns200AndStatusInProgress', async () => {
        // Arrange
        const app = createApp();
        const orderId = await createSentOrder(app);

        // Act
        const res = await request(app).post(`/api/kitchen/orders/${orderId}/start`);

        // Assert
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('in_progress');
    });
    it('startOrder_orderAlreadyInProgress_returns409', async () => {
        // Arrange
        const app = createApp();
        const orderId = await createSentOrder(app);
        await request(app).post(`/api/kitchen/orders/${orderId}/start`);

        // Act
        const res = await request(app).post(`/api/kitchen/orders/${orderId}/start`);

        // Assert
        expect(res.status).toBe(409);
        expect(res.body.error).toBe('Order is already in progress.');
    });
    it('markOrderReady_orderInProgress_returns200AndStatusReady', async () => {
        // Arrange
        const app = createApp();
        const orderId = await createSentOrder(app);
        await request(app).post(`/api/kitchen/orders/${orderId}/start`);

        // Act
        const res = await request(app).post(`/api/kitchen/orders/${orderId}/ready`);

        // Assert
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ready');
    });
    it('markOrderReady_orderNotStarted_returns409', async () => {
        // Arrange
        const app = createApp();
        const orderId = await createSentOrder(app);

        // Act
        const res = await request(app).post(`/api/kitchen/orders/${orderId}/ready`);

        // Assert
        expect(res.status).toBe(409);
        expect(res.body.error).toBe("Order can't be marked ready because it hasn't been started.");
    });
    it('markOrderReady_orderAlreadyReady_returns409', async () => {
        // Arrange
        const app = createApp();
        const orderId = await createReadyOrder(app);

        // Act
        const res = await request(app).post(`/api/kitchen/orders/${orderId}/ready`);

        // Assert
        expect(res.status).toBe(409);
        expect(res.body.error).toBe('Order is already marked as ready.');
    });

})
