function validateAccessCode(accessCode) {
    if (accessCode === '') {
        return 'Access code is required';
    }
    if (typeof accessCode !== 'string' || !/^\d{4}$/.test(accessCode)) {
        return 'Access code must be 4 digits long';
    }
    return null;
}

function getToken(req) {
    const authorization = req.get('Authorization');
    if (authorization?.startsWith('Bearer ')) {
        return authorization.slice(7);
    }

    const cookie = req.get('Cookie');
    const sessionCookie = cookie?.split('; ').find((part) => part.startsWith('session='));
    return sessionCookie?.slice('session='.length);
}

export default function createAuthController(authService) {
    return {
        login: (req, res) => {
            const validationError = validateAccessCode(req.body?.accessCode);
            if (validationError) {
                return res.status(400).json({ message: validationError });
            }

            const session = authService.login(req.body.accessCode);
            if (!session) {
                return res.status(401).json({ message: 'Invalid access code' });
            }

            res.cookie('session', session.token, { httpOnly: true, sameSite: 'lax' });
            res.status(200).json({
                message: 'Login successful',
                role: session.role,
                token: session.token,
            });
        },
        getSession: createSessionController(authService),
        logout: createLogoutController(authService),
        register: (req, res) => {
            const validationError = validateAccessCode(req.body?.accessCode);
            if (validationError) {
                return res.status(400).json({ message: validationError });
            }
            if (req.body.role !== 'waiter') {
                return res.status(400).json({ message: 'Invalid role' });
            }
            if (!authService.register(req.body.accessCode, req.body.role)) {
                return res.status(409).json({ message: 'Invalid credentials, already exists!' });
            }
            res.status(200).json({ role: req.body.role, message: 'Registration successful' });
        },
    };
}

function createSessionController(authService) {
    return (req, res) => {
        const role = authService.getSession(getToken(req));
        if (!role) {
            return res.status(401).json({ message: 'Not logged in' });
        }
        res.status(200).json({ role });
    };
}

function createLogoutController(authService) {
    return (req, res) => {
        if (!authService.logout(getToken(req))) {
            return res.status(401).json({ message: 'Not logged in' });
        }
        res.clearCookie('session');
        res.status(200).json({ message: 'Logout successful' });
    };
}

export { getToken };
