const TOKEN_KEY = 'flower_shop_token';
const USER_KEY = 'flower_shop_user';

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function authHeader() {
    const token = getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function fetchWithAuth(url, options = {}) {
    const authHeaders = authHeader();
    const headers = { ...authHeaders, ...(options.headers || {}) };

    // Nếu body là FormData (để upload ảnh), PHẢI xóa Content-Type để trình duyệt tự lo
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    } else {
        if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
    }

    return fetch(url, { ...options, headers });
}

async function requireRole(allowedRoles = []) {
    const token = getToken();
    if (!token) { window.location.href = '/login.html'; return null; }
    try {
        const res = await fetchWithAuth('/api/auth/me');
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (allowedRoles.length && !allowedRoles.includes(data.user.role)) {
            window.location.href = '/storefront.html';
            return null;
        }
        return data.user;
    } catch {
        localStorage.clear();
        window.location.href = '/login.html';
        return null;
    }
}