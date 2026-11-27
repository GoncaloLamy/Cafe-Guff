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
import createAuthRouter from './routes/authRouter.js';
import createWeatherRouter from './routes/weatherRouter.js';
import createMenuService from './services/menuService.js';
import createBillService from './services/billService.js';
import createOrderService from './services/orderService.js';
import createWeatherController from './controllers/weatherController.js';
import createWeatherService from './services/weatherService.js';
import createAuthService from './services/authService.js';
import createAuthController from './controllers/authController.js';
import { createRequireAuth, createRequireRole } from './middleware/auth.js';

function getAuthMiddleware(enabled, requireAuth) {
    return enabled ? [requireAuth] : [];
}

function registerLoginPageRoutes(app) {
    app.get('/login', (req, res) => {
        res.sendFile(path.join(import.meta.dirname, '..', 'public', 'login.html'));
    });
    app.get('/login.html', (req, res) => {
        res.redirect(301, '/login');
    });
}

export function createApp({
                              menuRepository = createInMemoryMenuRepository(),
                              orderRepository = createInMemoryOrderRepository(),
                              fetch = globalThis.fetch,
                              authEnabled = false,
                          } = {}) {
    const app = express();
    const menuService = createMenuService(menuRepository);
    const orderService = createOrderService(orderRepository, menuRepository);
    const billService = createBillService(orderRepository, menuRepository);
    const weatherService = createWeatherService(fetch);
    const authService = createAuthService();
    const requireAuth = createRequireAuth(authService);

    app.use(logger);
    app.use(express.json());
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok' });
    });
    app.use('/api', createAuthRouter(createAuthController(authService)));
    registerLoginPageRoutes(app);
    app.get('/', ...getAuthMiddleware(authEnabled, requireAuth), (req, res) => {
        res.sendFile(path.join(import.meta.dirname, '..', 'public', 'index.html'));
    });
    app.get('/index.html', ...getAuthMiddleware(authEnabled, requireAuth), (req, res) => {
        res.sendFile(path.join(import.meta.dirname, '..', 'public', 'index.html'));
    });
    app.get('/weather', (req, res) => {
        res.sendFile(path.join(import.meta.dirname, '..', 'public', 'weather.html'));
    });
    app.get('/admin-only-route', requireAuth, createRequireRole('admin'), (req, res) => {
        res.status(200).json({ message: 'Access granted' });
    });
    app.use('/api/menu', createMenuRouter(createMenuController(menuService)));
    app.use('/api', createOrderRouter(createOrderController(orderService, billService)));
    app.use('/api/weather', createWeatherRouter(createWeatherController(weatherService)));
    app.use(express.static(path.join(import.meta.dirname, '..', 'public')));
    app.use(notFound);
    app.use(errorHandler);

    return app;
}

export default createApp({ authEnabled: true });