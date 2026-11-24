import express from 'express';

export default function createOrderRouter(controller) {
    const router = express.Router();
    router.post('/', controller.create);
    router.patch('/:id', controller.update);
    return router;
}
