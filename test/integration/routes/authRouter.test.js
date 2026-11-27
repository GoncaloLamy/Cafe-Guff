import {describe, it, expect} from 'vitest';
import request from 'supertest';
import app from '../../../src/app.js';

const credentials = {
    accessCode: '1234',
    role: 'admin',
}

describe('Auth Router', () => {
    it('should return a 200 status code for login when entered a correct 4 cifred code ', async () => {
        const response = await request(app).post('/api/login').send(credentials);

        expect(response.status).toBe(200)
        expect(response.body.message).toBe('Login successful');
    })

    it('should return a 401 status code for login when entered an incorrect 4 cifred code', async () => {
        const response = await request(app).post('/api/login').send({...credentials, accessCode: '5678'});

        expect(response.status).toBe(401)
        expect(response.body.message).toBe('Invalid access code');
    })

    it('should return status 400 too short', async () => {
        const response = await request(app).post('/api/login').send({...credentials, accessCode: '123'});

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Access code must be 4 digits long');
    })

    it('should return status 400 too long', async () => {
        const response = await request(app).post('/api/login').send({...credentials, accessCode: '12345'});

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Access code must be 4 digits long');
    })

    it('should return a 200 status code for logout', async () => {
        await request(app).post('/api/login').send(credentials);

        const response = await request(app).post('/api/logout');

        expect(response.status).toBe(200)
        expect(response.body.message).toBe('Logout successful');
    })

    it('should return a 401 status code for logout when not logged in', async () => {
        const response = await request(app).post('/api/logout');

        expect(response.status).toBe(401)
        expect(response.body.message).toBe('Not logged in');
    })

    it('should return a 400 status code when entered code is empty', async () => {
        const response = await request(app).post('/api/login').send({...credentials, accessCode: ''});

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Access code is required');
    })

    it('when /logout is not called, a session is still valid', async () => {
        // This test would require a session management implementation to check if the session persists without calling /logout
        // Use jwt for ease
    })

    it('login with owner code should return role: "admin"', async () => {
        const response = await request(app).post('/api/login').send({...credentials, accessCode: '1234'});

        expect(response.status).toBe(200)
        expect(response.body.role).toBe('admin');
        expect(response.body.message).toBe('Login successful');

    })

    it('login with waiter code should return role: "waiter"', async () => {
        const response = await request(app).post('/api/login').send({
            ...credentials,
            role: 'waiter',
            accessCode: '9876',
        });

        expect(response.status).toBe(200)
        expect(response.body.role).toBe('waiter');
        expect(response.body.message).toBe('Login successful');

    })

    it('waiter should not have owner / admin rights should return status 403', async () => {
        const response = await request(app).post('/api/login').send({
            ...credentials,
            role: 'waiter',
            accessCode: '9876',

        });
        expect(response.status).toBe(200);
        expect(response.body.role).toBe('waiter');
        expect(response.body.message).toBe('Login successful');

        const response2 = await request(app).get('/admin-only-route').set(
            'Authorization', `Bearer ${response.body.token}`);

        expect(response2.status).toBe(403)
        expect(response2.body.message).toBe('Access denied');
    })

    it('protected route should redirect to login, if not logged in', async () => {
        const response = await request(app).get('/');

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/login');

    })

    it('Every waiter and admin should have a unique code', async () => {
        const agent = request.agent(app);
        const response3 = await agent.post('/api/login').send(credentials);
        expect(response3.status).toBe(200);
        expect(response3.body.message).toBe('Login successful');

        const response = await agent.post('/api/register').send({
            ...credentials,
            role: 'waiter',
            accessCode: '9876'

        });

        expect(response.status).toBe(200);
        expect(response.body.role).toBe('waiter');
        expect(response.body.message).toBe('Registration successful');

        const response2 = await agent.post('/api/register').send({
            ...credentials,
            role: 'waiter',
            accessCode: '9876'

        });


        expect(response2.status).toBe(409);
        expect(response2.body.message).toBe('Invalid credentials, already exists!');
    })

    it('should return a 400 status code when entered code is letters', async () => {
        const agent = request.agent(app);
        const loginResponse = await agent.post('/api/login').send(credentials);
        expect(loginResponse.status).toBe(200);

        const response = await agent.post('/api/register').send({...credentials, accessCode: 'abcd'});

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Access code must be 4 digits long');
    })
})