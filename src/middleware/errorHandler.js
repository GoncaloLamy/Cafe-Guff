export default function errorHandler(error, req, res, next) {
    console.error(error);

    if (error.status === 400) {
        return res.status(400).json({ error: 'Invalid JSON' });
    }
    if (error.status === 413) {
        return res.status(413).json({ error: 'Payload too large' });
    }

    res.status(500).json({ error: 'Internal server error' });
}