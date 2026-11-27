function getToken(req) {
    const authorization = req.get('Authorization');
    if (authorization?.startsWith('Bearer ')) {
        return authorization.slice(7);
    }

    const cookie = req.get('Cookie');
    const sessionCookie = cookie?.split('; ').find((part) => part.startsWith('session='));
    return sessionCookie?.slice('session='.length);
}

export function createRequireAuth(authService) {
    return (req, res, next) => {
        const role = authService.getSession(getToken(req));
        if (!role) {
            if (req.path === '/' || req.path === '/index.html') {
                return res.redirect(302, '/login');
            }
            return res.status(401).json({ message: 'Not logged in' });
        }

        req.auth = { role };
        next();
    };
}

export function createRequireRole(role) {
    return (req, res, next) => {
        if (req.auth?.role !== role) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
}
