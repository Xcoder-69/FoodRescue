const API_BASE_URL = 'https://foodrescue-backend-l5x4.onrender.com/api';

/**
 * Global API Utility for FoodRescue
 * Automatically attaches JWT Bearer tokens to requests and handles common errors.
 * Includes timeout + retry to handle Render free-tier cold-starts.
 */
const ApiClient = class {
    static DEFAULT_TIMEOUT = 20000; // 20 seconds
    static COLD_START_MSG  = '⏳ Server is waking up — this can take up to 30 seconds on first use. Please try again.';

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

    /**
     * Wraps fetch() with an AbortController timeout.
     * Throws a user-friendly error on timeout instead of hanging forever.
     */
    static async fetchWithTimeout(url, options = {}, timeoutMs = this.DEFAULT_TIMEOUT) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            return response;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error(this.COLD_START_MSG);
            }
            // Network error (offline, DNS failure, CORS, etc.)
            if (!navigator.onLine) {
                throw new Error('You appear to be offline. Please check your internet connection.');
            }
            throw new Error(this.COLD_START_MSG);
        } finally {
            clearTimeout(timer);
        }
    }

    /**
     * Fetch with automatic retry on timeout / network errors.
     * First attempt uses `timeoutMs`; retry uses the same timeout.
     * Only retries on timeout/network errors, NOT on HTTP errors (4xx/5xx).
     */
    static async fetchWithRetry(url, options = {}, { retries = 1, timeoutMs = this.DEFAULT_TIMEOUT, onRetry = null } = {}) {
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                return await this.fetchWithTimeout(url, options, timeoutMs);
            } catch (error) {
                const isLastAttempt = attempt === retries;
                if (isLastAttempt) throw error;
                // Notify caller that we're retrying (for UI updates)
                if (onRetry) onRetry(attempt + 1);
                // Small delay before retry
                await new Promise(r => setTimeout(r, 2000));
            }
        }
    }

    /**
     * Public method for pages that use raw fetch() instead of ApiClient.request().
     * Provides timeout + retry + JSON parsing in one call.
     * Returns { response, data } so callers can check response.ok.
     */
    static async rawFetch(endpoint, options = {}, { timeoutMs = this.DEFAULT_TIMEOUT, onRetry = null } = {}) {
        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
        const response = await this.fetchWithRetry(url, options, { retries: 1, timeoutMs, onRetry });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || data.error || 'Request failed');
        }
        return data;
    }

    // Attempt silent token refresh, returns true on success
    static async tryRefresh() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) return false;
        try {
            const res = await this.fetchWithTimeout(`${API_BASE_URL}/auth/refresh`, {
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
            let response = await this.fetchWithTimeout(url, { ...options, headers });
            let data = await response.json();

            // Auto-refresh on TOKEN_EXPIRED
            if (response.status === 401 && data.code === 'TOKEN_EXPIRED') {
                const refreshed = await this.tryRefresh();
                if (refreshed) {
                    // Retry original request with new token
                    headers['Authorization'] = `Bearer ${this.getToken()}`;
                    response = await this.fetchWithTimeout(url, { ...options, headers });
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
};

window.ApiClient = ApiClient;
