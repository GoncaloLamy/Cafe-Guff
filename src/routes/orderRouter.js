import express from 'express';
import {
    createOrder,
    updateOrderItems,
} from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.post('/', createOrder);
orderRouter.patch('/:id', updateOrderItems);

export default orderRouter;
