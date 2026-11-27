import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app.js';

describe('Session role display', () => {
    it('returns the role for the current logged-in session', async () => {
        const agent = request.agent(createApp());
        await agent.post('/api/login').send({ accessCode: '1234' });

        const response = await agent.get('/api/session');

        expect(response.status).toBe(200);
        expect(response.body.role).toBe('admin');
    });

    it('rejects a session lookup when not logged in', async () => {
        const response = await request(createApp()).get('/api/session');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Not logged in');
    });

    it.each(['/', '/weather'])('loads the shared role display on %s', async (path) => {
        const response = await request(createApp()).get(path);

        expect(response.status).toBe(200);
        expect(response.text).toContain('id="current-role"');
        expect(response.text).toContain('src="/js/session.js"');

        const scriptResponse = await request(createApp()).get('/js/session.js');
        expect(scriptResponse.status).toBe(200);
    });
});
