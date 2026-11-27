import { createApp } from './app.js';
import { port } from './config/config.js';
import createInMemoryMenuRepository from './repositories/inMemoryMenuRepository.js';
import createInMemoryOrderRepository from './repositories/inMemoryOrderRepository.js';

function startServer() {
    const app = createApp({
        menuRepository: createInMemoryMenuRepository(),
        orderRepository: createInMemoryOrderRepository(),
        authEnabled: true,
    });

    app.listen(port);
}

startServer();
