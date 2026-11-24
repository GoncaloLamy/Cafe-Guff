import express from 'express';

export default function createWeatherRouter(controller) {
    const router = express.Router();
    router.get('/', controller.getWeather);
    return router;
}
