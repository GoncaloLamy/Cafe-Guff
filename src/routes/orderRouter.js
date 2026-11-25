import express from 'express';
import {
    validateCreateOrderInput,
    validateUpdateOrderInput,
} from '../middleware/validateOrderInput.js';

export default function createOrderRouter(controller) {
    const router = express.Router();
    router.post('/', validateCreateOrderInput, controller.create);
    router.post('/:id/close', controller.close);
    router.patch('/:id', validateUpdateOrderInput, controller.update);
    return router;
}
