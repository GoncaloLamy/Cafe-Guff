const loginForm = document.getElementById('login-form');
const accessCodeInput = document.getElementById('access-code');
const loginError = document.getElementById('login-error');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    loginError.textContent = '';

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessCode: accessCodeInput.value }),
        });
        if (!response.ok) {
            loginError.textContent = 'Pinkoden er forkert eller ugyldig.';
            return;
        }

        window.location.assign('/');
    } catch {
        loginError.textContent = 'Login kunne ikke gennemføres lige nu.';
    }
});
