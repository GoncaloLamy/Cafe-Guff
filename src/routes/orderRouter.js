import express from 'express';

export default function createOrderRouter(controller) {
    const router = express.Router();
    router.post('/orders', controller.create);
    router.post('/orders/:id/close', controller.close);
    router.post('/orders/:id/split', controller.split);
    router.patch('/orders/:id', controller.update);
    router.post('/bills/:billId/close', controller.closeBill);
    return router;
}
