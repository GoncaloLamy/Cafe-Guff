import mongoose from 'mongoose';
import { createApp } from './app.js';
import { mongoDbUri, port } from './config/config.js';
import createMenuRepository from './repositories/menuRepository.js';
import createOrderRepository from './repositories/orderRepository.js';

async function startServer() {
    await mongoose.connect(mongoDbUri);

    const app = createApp({
        menuRepository: createMenuRepository(),
        orderRepository: createOrderRepository(),
    });

    app.listen(port);
}

startServer().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
