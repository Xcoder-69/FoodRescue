const { test, expect } = require('@playwright/test');

test.describe('Security Audit API Tests', () => {
    
    test('1. Rate Limiting on Login Endpoint', async ({ request }) => {
        const url = 'http://localhost:3000/api/auth/login';
        
        let rateLimited = false;
        // The limit is 5 per 15 minutes, so 10 requests should trigger a 429
        for (let i = 0; i < 10; i++) {
            const res = await request.post(url, {
                data: { email: 'test@example.com', password: `pass${i}` },
                headers: { 'x-test-ip': '127.0.0.10' }
            });
            if (res.status() === 429) {
                rateLimited = true;
                const body = await res.json();
                expect(body.error).toContain('Too many requests');
                break;
            }
        }
        
        expect(rateLimited).toBe(true);
    });

    test('2. Rate Limiting on Register Endpoint', async ({ request }) => {
        const url = 'http://localhost:3000/api/auth/register';
        
        let rateLimited = false;
        for (let i = 0; i < 10; i++) {
            const res = await request.post(url, {
                data: { email: `new${i}@example.com`, password: 'password123' },
                headers: { 'x-test-ip': '127.0.0.11' }
            });
            if (res.status() === 429) {
                rateLimited = true;
                break;
            }
        }
        
        expect(rateLimited).toBe(true);
    });
});
