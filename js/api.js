var API_BASE_URL = 'https://foodrescue-jhyr.onrender.com/api';

/**
 * Global API Utility for FoodRescue
 * Automatically attaches JWT Bearer tokens to requests and handles common errors.
 */
var ApiClient = class {
    static getToken() {
        return localStorage.getItem('foodRescueToken');
    }

    static setToken(token) {
        localStorage.setItem('foodRescueToken', token);
    }

    static getRefreshToken() {
        return localStorage.getItem('foodRescueRefreshToken');
    }

    static setRefreshToken(token) {
        localStorage.setItem('foodRescueRefreshToken', token);
    }

    static clearSession() {
        localStorage.removeItem('foodRescueToken');
        localStorage.removeItem('foodRescueRefreshToken');
        localStorage.removeItem('foodRescueUser');
        localStorage.removeItem('fr_role');
        window.location.href = '4_login_and_verification.html';
    }

    // Attempt silent token refresh, returns true on success
    static async tryRefresh() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) return false;
        try {
            const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });
            if (!res.ok) return false;
            const data = await res.json();
            const newAccess = data.data?.accessToken || data.accessToken;
            const newRefresh = data.data?.refreshToken || data.refreshToken;
            if (newAccess) { this.setToken(newAccess); }
            if (newRefresh) { this.setRefreshToken(newRefresh); }
            return !!newAccess;
        } catch { return false; }
    }

    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            let response = await fetch(url, { ...options, headers });
            let data = await response.json();

            // Auto-refresh on TOKEN_EXPIRED
            if (response.status === 401 && data.code === 'TOKEN_EXPIRED') {
                const refreshed = await this.tryRefresh();
                if (refreshed) {
                    // Retry original request with new token
                    headers['Authorization'] = `Bearer ${this.getToken()}`;
                    response = await fetch(url, { ...options, headers });
                    data = await response.json();
                } else {
                    // Don't redirect if in test mode
                    if (localStorage.getItem('fr_test_mode') !== 'true') this.clearSession();
                    return null;
                }
            }

            if (response.status === 401) {
                console.warn('Session expired or unauthorized');
                // Don't redirect if in test mode
                if (localStorage.getItem('fr_test_mode') !== 'true') this.clearSession();
                return null;
            }

            if (!response.ok) {
                throw new Error(data.message || data.error || 'API Request Failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error.message);
            throw error;
        }
    }

    static async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    static async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    static async patch(endpoint, body) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body)
        });
    }

    static async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    static async del(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

window.ApiClient = ApiClient;
