async function loadCurrentRole() {
    const roleElement = document.getElementById('current-role');

    try {
        const response = await fetch('/api/session');
        if (!response.ok) {
            throw new Error('Session request failed');
        }

        const session = await response.json();
        const roleLabels = { admin: 'Ejer', waiter: 'Tjener' };
        roleElement.textContent = roleLabels[session.role] ?? 'Ukendt rolle';
    } catch {
        roleElement.textContent = 'Rolle kunne ikke hentes.';
    }
}

loadCurrentRole();
