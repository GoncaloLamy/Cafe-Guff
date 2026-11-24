import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../../src/app.js';

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