import express from 'express';

export default function createMenuRouter(controller) {
    const router = express.Router();
    router.get('/', controller.getMenu);
    return router;
}
