const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Global API Utility for FoodRescue
 * Automatically attaches JWT Bearer tokens to requests and handles common errors.
 */
class ApiClient {
    static getToken() {
        return localStorage.getItem('foodRescueToken');
    }

    static setToken(token) {
        localStorage.setItem('foodRescueToken', token);
    }

    static clearSession() {
        localStorage.removeItem('foodRescueToken');
        localStorage.removeItem('foodRescueUser');
        window.location.href = '2_login.html';
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
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            // Handle unauthorized / token expiration natively
            if (response.status === 401) {
                console.warn('Session expired or unauthorized');
                this.clearSession();
                return null;
            }

            if (!response.ok) {
                throw new Error(data.error || 'API Request Failed');
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
        return this.request(endpoint, {
            method: 'GET'
        });
    }

    static async patch(endpoint, body) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body)
        });
    }
}

window.ApiClient = ApiClient;
