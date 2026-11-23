import express from 'express';
import orderRouter from './routes/orderRouter.js';

export function createApp() {
    const app = express();

    app.use(express.json());
    app.use('/api/orders', orderRouter);

    return app;
}

export default createApp();
