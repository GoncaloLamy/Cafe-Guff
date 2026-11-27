import { randomUUID } from 'node:crypto';

const defaultStaff = [
    { accessCode: '1234', role: 'admin' },
    { accessCode: '9876', role: 'waiter' },
];

function createStaffByCode() {
    return new Map(
        defaultStaff.map(({ accessCode, role }) => [accessCode, role]),
    );
}

function createLogin(staffByCode, sessions, tokenByCode) {
    return (accessCode) => {
        const role = staffByCode.get(accessCode);
        if (!role) {
            return null;
        }

        const existingToken = tokenByCode.get(accessCode);
        if (existingToken && sessions.has(existingToken)) {
            return { role, token: existingToken };
        }

        const token = randomUUID();
        sessions.set(token, { role, accessCode });
        tokenByCode.set(accessCode, token);
        return { role, token };
    };
}

function createRegistration(staffByCode, registeredCodes) {
    return (accessCode, role) => {
        if (registeredCodes.has(accessCode)) {
            return false;
        }

        const existingRole = staffByCode.get(accessCode);
        if (existingRole && existingRole !== role) {
            return false;
        }

        staffByCode.set(accessCode, role);
        registeredCodes.add(accessCode);
        return true;
    };
}

function createLogout(sessions, tokenByCode) {
    return (token) => {
        let sessionToken = token;
        if (!sessionToken && sessions.size === 1) {
            sessionToken = sessions.keys().next().value;
        }
        const session = sessions.get(sessionToken);
        if (!session) {
            return false;
        }

        sessions.delete(sessionToken);
        tokenByCode.delete(session.accessCode);
        return true;
    };
}

export default function createAuthService() {
    const staffByCode = createStaffByCode();
    const registeredCodes = new Set(['1234']);
    const sessions = new Map();
    const tokenByCode = new Map();

    return {
        login: createLogin(staffByCode, sessions, tokenByCode),
        register: createRegistration(staffByCode, registeredCodes),
        getSession: (token) => sessions.get(token)?.role ?? null,
        logout: createLogout(sessions, tokenByCode),
    };
}
