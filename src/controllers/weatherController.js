export default function createWeatherController(weatherService) {
    return {
        getWeather: async (req, res) => {
            const latitude = req.query.latitude === undefined
                ? 55.6861
                : Number(req.query.latitude);
            const longitude = req.query.longitude === undefined
                ? 12.5439
                : Number(req.query.longitude);

            if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
                return res.status(400).json({ error: 'Invalid weather request' });
            }

            const weather = await weatherService.getWeather({
                latitude,
                longitude,
            });
            return res.status(200).json(weather);
        },
    };
}
