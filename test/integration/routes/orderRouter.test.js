import {beforeAll, afterAll, describe, it, expect} from 'vitest';
import request from 'supertest';
import app from '../../../src/app.js';
import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';


let mongoServer;
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

});
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
})

describe('delete item in order', () => {
    it('should delete item from order', async () => {
        const order = {
            table: 1,
            items: [
                {name: 'Coffee', quantity: 2},
                {name: 'Sandwich', quantity: 1}
            ],
            status: 'pending',
            id: '6b042294ebca19b3cdfb78e4',
        };
        await request(app).post('/api/orders').send(order);

        const response = await request(app).patch('/api/orders/6b042294ebca19b3cdfb78e4').send({
            items: [{
                name: 'Coffee',
                quantity: 1
            }]
        });

        expect(response.status).toBe(201);
        expect(response.body.items.length).toBe(1);
        expect(response.body.items[0].name).toBe('Coffee');
        expect(response.body.items[0].quantity).toBe(1);
    });


});
