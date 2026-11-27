import express from 'express';

export default function createAuthRouter(controller) {
    const router = express.Router();
    router.post('/login', controller.login);
    router.get('/session', controller.getSession);
    router.post('/logout', controller.logout);
    router.post('/register', controller.register);
    return router;
}
