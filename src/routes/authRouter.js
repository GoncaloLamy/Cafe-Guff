import express from 'express';

export default function createAuthRouter(controller, requireAuth, requireAdmin) {
    const router = express.Router();
    router.post('/login', controller.login);
    router.get('/session', controller.getSession);
    router.post('/logout', controller.logout);
    router.post('/register', requireAuth, requireAdmin, controller.register);
    return router;
}
