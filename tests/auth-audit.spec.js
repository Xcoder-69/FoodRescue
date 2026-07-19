const { test, expect } = require('@playwright/test');
const { db } = require('../src/config/firebase');
const jwt = require('jsonwebtoken');

test.describe('Authorization & Session Audits', () => {
    
    test('1. Refresh Token 2FA Bypass Prevention', async ({ request }) => {
        // Register a user
        const email = `test2fa_${Date.now()}@example.com`;
        const regRes = await request.post('http://localhost:3009/api/auth/register', {
            data: { email, password: 'password123', role: 'volunteer' }
        });

        if (regRes.status() === 429) {
            console.log('Skipping due to rate limit');
            return;
        }

        const body = await regRes.json();
        const { refreshToken } = body.data.tokens;
        const uid = body.data.user.uid;

        // Manually enable 2FA on the user in Firestore to simulate 2FA requirement
        await db.collection('users').doc(uid).update({ isTwoFactorEnabled: true });

        // Now, attempt to refresh the token using the refresh token acquired *before* 2FA was theoretically completed.
        // Wait, if we use the refresh token, the backend should return is2FAVerified: false
        const refreshRes = await request.post('http://localhost:3009/api/auth/refresh', {
            data: { refreshToken }
        });

        expect(refreshRes.status()).toBe(200);
        const refreshData = await refreshRes.json();
        if (!refreshRes.ok()) {
            console.log('Refresh failed:', refreshData);
        }
        const newAccessToken = refreshData.data?.tokens?.accessToken;
        
        expect(newAccessToken).toBeTruthy();

        // Decode the JWT to check is2FAVerified
        const decoded = jwt.decode(newAccessToken);
        expect(decoded).not.toBeNull();
        expect(decoded.is2FAVerified).toBe(false); // Should NOT be elevated to true!
    });

    test('2. Password Reset Invalidates Sessions', async ({ request }) => {
        // Register a user
        const email = `reset_${Date.now()}@example.com`;
        const regRes = await request.post('http://localhost:3009/api/auth/register', {
            data: { email, password: 'password123', role: 'volunteer' }
        });

        if (regRes.status() === 429) return;

        const body = await regRes.json();
        const { refreshToken } = body.data.tokens;
        const uid = body.data.user.uid;

        // Manually generate an OTP in DB for reset
        const otp = '123456';
        await db.collection('otps').doc(`${email}_reset`).set({
            email, otp, purpose: 'reset', expiresAt: new Date(Date.now() + 100000), used: false, attempts: 0
        });

        // Call reset password API
        const resetRes = await request.post('http://localhost:3009/api/auth/reset-password', {
            data: { email, otp, newPassword: 'newpassword123' }
        });
        
        expect(resetRes.status()).toBe(200);

        // Attempt to use the old refresh token
        const refreshRes = await request.post('http://localhost:3009/api/auth/refresh', {
            data: { refreshToken }
        });

        // The session should have been deleted, meaning refresh will fail!
        expect(refreshRes.status()).toBe(401);
        const refreshData = await refreshRes.json();
        expect(refreshData.message).toContain('Invalid refresh token'); // Or whatever the error is
    });
});
