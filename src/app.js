import express from 'express';
import path from 'node:path';
import createMenuController from './controllers/menuController.js';
import createOrderController from './controllers/orderController.js';
import errorHandler from './middleware/errorHandler.js';
import logger from './middleware/logger.js';
import notFound from './middleware/notFound.js';
import createInMemoryMenuRepository from './repositories/inMemoryMenuRepository.js';
import createInMemoryOrderRepository from './repositories/inMemoryOrderRepository.js';
import createMenuRouter from './routes/menuRouter.js';
import createOrderRouter from './routes/orderRouter.js';
import createWeatherRouter from './routes/weatherRouter.js';
import createMenuService from './services/menuService.js';
import createOrderService from './services/orderService.js';
import createWeatherController from './controllers/weatherController.js';
import createWeatherService from './services/weatherService.js';

export function createApp({
    menuRepository = createInMemoryMenuRepository(),
    orderRepository = createInMemoryOrderRepository(),
    fetch = globalThis.fetch,
} = {}) {
    const app = express();
    const menuService = createMenuService(menuRepository);
    const orderService = createOrderService(orderRepository, menuRepository);
    const weatherService = createWeatherService(fetch);

    app.use(logger);
    app.use(express.json());
    app.use(express.static(path.join(import.meta.dirname, '..', 'public')));
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok' });
    });
    app.use('/api/menu', createMenuRouter(createMenuController(menuService)));
    app.use('/api/orders', createOrderRouter(createOrderController(orderService)));
    app.use('/api/weather', createWeatherRouter(createWeatherController(weatherService)));
    app.use(notFound);
    app.use(errorHandler);

    return app;
}

export default createApp();
