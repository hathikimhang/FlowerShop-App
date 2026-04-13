const TOKEN_KEY = 'flower_shop_token';
const USER_KEY = 'flower_shop_user';

function saveAuth(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function getCurrentUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (_e) {
        return null;
    }
}

function authHeader() {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchWithAuth(url, options = {}) {
    const headers = {
        ...(options.headers || {}),
        ...authHeader()
    };
    return fetch(url, { ...options, headers });
}

function redirectByRole(user) {
    if (user.role === 'admin') {
        window.location.href = 'admin.html';
        return;
    }
    window.location.href = 'storefront.html';
}

async function requireRole(allowedRoles) {
    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        return null;
    }

    try {
        const res = await fetchWithAuth('/api/auth/me');
        if (!res.ok) {
            clearAuth();
            window.location.href = 'login.html';
            return null;
        }
        const data = await res.json();
        const user = data.user;
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        if (!allowedRoles.includes(user.role)) {
            redirectByRole(user);
            return null;
        }
        return user;
    } catch (_err) {
        clearAuth();
        window.location.href = 'login.html';
        return null;
    }
}
