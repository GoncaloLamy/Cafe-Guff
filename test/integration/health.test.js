import { describe, it } from 'vitest';

// Eksempel på mønstret, når createApp findes:
//
// import request from 'supertest';
// import { createApp } from '../../src/app.js';
//
// it('health_ok_returns200', async () => {
//   // Arrange
//   const app = createApp();
//
//   // Act
//   const res = await request(app).get('/health');
//
//   // Assert
//   expect(res.status).toBe(200);
// });

describe('app', () => {
    it.todo('health_ok_returns200');
    it.todo('unknownRoute_requested_returns404');
    it.todo('invalidJson_posted_returns400');
});