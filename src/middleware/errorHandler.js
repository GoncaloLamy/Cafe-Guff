export default function errorHandler(error, req, res, next) {
    console.error(error);
    const status = error.status === 400 ? 400 : 500;
    const message = status === 400
        ? 'Invalid JSON'
        : 'Internal server error';
    res.status(status).json({ error: message });
}
