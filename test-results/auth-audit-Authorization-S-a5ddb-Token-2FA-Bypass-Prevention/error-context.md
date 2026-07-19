# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-audit.spec.js >> Authorization & Session Audits >> 1. Refresh Token 2FA Bypass Prevention
- Location: tests\auth-audit.spec.js:7:5

# Error details

```
SyntaxError: Unexpected token '<', "
		<!DOCTYPE "... is not valid JSON
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | const { db } = require('../src/config/firebase');
  3  | const jwt = require('jsonwebtoken');
  4  | 
  5  | test.describe('Authorization & Session Audits', () => {
  6  |     
  7  |     test('1. Refresh Token 2FA Bypass Prevention', async ({ request }) => {
  8  |         // Register a user
  9  |         const email = `test2fa_${Date.now()}@example.com`;
  10 |         const regRes = await request.post('http://localhost:3000/api/auth/register', {
  11 |             data: { email, password: 'password123', role: 'volunteer' }
  12 |         });
  13 | 
  14 |         if (regRes.status() === 429) {
  15 |             console.log('Skipping due to rate limit');
  16 |             return;
  17 |         }
  18 | 
> 19 |         const body = await regRes.json();
     |                      ^ SyntaxError: Unexpected token '<', "
  20 |         const { refreshToken } = body.data.tokens;
  21 |         const uid = body.data.user.uid;
  22 | 
  23 |         // Manually enable 2FA on the user in Firestore to simulate 2FA requirement
  24 |         await db.collection('users').doc(uid).update({ isTwoFactorEnabled: true });
  25 | 
  26 |         // Now, attempt to refresh the token using the refresh token acquired *before* 2FA was theoretically completed.
  27 |         // Wait, if we use the refresh token, the backend should return is2FAVerified: false
  28 |         const refreshRes = await request.post('http://localhost:3000/api/auth/refresh', {
  29 |             data: { refreshToken }
  30 |         });
  31 | 
  32 |         expect(refreshRes.status()).toBe(200);
  33 |         const refreshData = await refreshRes.json();
  34 |         if (!refreshRes.ok()) {
  35 |             console.log('Refresh failed:', refreshData);
  36 |         }
  37 |         const newAccessToken = refreshData.data?.tokens?.accessToken;
  38 |         
  39 |         expect(newAccessToken).toBeTruthy();
  40 | 
  41 |         // Decode the JWT to check is2FAVerified
  42 |         const decoded = jwt.decode(newAccessToken);
  43 |         expect(decoded).not.toBeNull();
  44 |         expect(decoded.is2FAVerified).toBe(false); // Should NOT be elevated to true!
  45 |     });
  46 | 
  47 |     test('2. Password Reset Invalidates Sessions', async ({ request }) => {
  48 |         // Register a user
  49 |         const email = `reset_${Date.now()}@example.com`;
  50 |         const regRes = await request.post('http://localhost:3000/api/auth/register', {
  51 |             data: { email, password: 'password123', role: 'volunteer' }
  52 |         });
  53 | 
  54 |         if (regRes.status() === 429) return;
  55 | 
  56 |         const body = await regRes.json();
  57 |         const { refreshToken } = body.data.tokens;
  58 |         const uid = body.data.user.uid;
  59 | 
  60 |         // Manually generate an OTP in DB for reset
  61 |         const otp = '123456';
  62 |         await db.collection('otps').doc(`${email}_reset`).set({
  63 |             email, otp, purpose: 'reset', expiresAt: new Date(Date.now() + 100000), used: false, attempts: 0
  64 |         });
  65 | 
  66 |         // Call reset password API
  67 |         const resetRes = await request.post('http://localhost:3000/api/auth/reset-password', {
  68 |             data: { email, otp, newPassword: 'newpassword123' }
  69 |         });
  70 |         
  71 |         expect(resetRes.status()).toBe(200);
  72 | 
  73 |         // Attempt to use the old refresh token
  74 |         const refreshRes = await request.post('http://localhost:3000/api/auth/refresh', {
  75 |             data: { refreshToken }
  76 |         });
  77 | 
  78 |         // The session should have been deleted, meaning refresh will fail!
  79 |         expect(refreshRes.status()).toBe(401);
  80 |         const refreshData = await refreshRes.json();
  81 |         expect(refreshData.message).toContain('Invalid refresh token'); // Or whatever the error is
  82 |     });
  83 | });
  84 | 
```