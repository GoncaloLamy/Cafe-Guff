import express from 'express';
import {
    validateCreateOrderInput,
    validateUpdateOrderInput,
} from '../middleware/validateOrderInput.js';

export default function createOrderRouter(controller) {
    const router = express.Router();
    router.post('/orders', validateCreateOrderInput, controller.create);
    router.post('/orders/:id/send', controller.send);
    router.post('/orders/:id/close', controller.close);
    router.post('/orders/:id/split', controller.split);
    router.patch('/orders/:id', validateUpdateOrderInput, controller.update);
    router.get('/kitchen/orders', controller.kitchenOrders);
    router.post('/kitchen/orders/:id/start', controller.start);
    router.post('/kitchen/orders/:id/ready', controller.ready);
    router.post('/bills/:billId/close', controller.closeBill);
    return router;
}