import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app.js';

describe('Login page route', () => {
    it('serves the login page at /login', async () => {
        const response = await request(createApp()).get('/login');

        expect(response.status).toBe(200);
        expect(response.text).toContain('id="login-form"');
    });

    it('redirects the old login.html path to /login', async () => {
        const response = await request(createApp()).get('/login.html');

        expect(response.status).toBe(301);
        expect(response.headers.location).toBe('/login');
    });
});
