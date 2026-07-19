# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: magic-byte.spec.js >> Magic Bytes Validation API Tests >> 1. Backend rejects spoofed executable files
- Location: tests\magic-byte.spec.js:6:5

# Error details

```
SyntaxError: Unexpected token '<', "
		<!DOCTYPE "... is not valid JSON
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | const crypto = require('crypto');
  3  | 
  4  | test.describe('Magic Bytes Validation API Tests', () => {
  5  | 
  6  |     test('1. Backend rejects spoofed executable files', async ({ request }) => {
  7  |         // We need a valid token to access upload routes
  8  |         const registerRes = await request.post('http://localhost:3000/api/auth/register', {
  9  |             data: { email: `mockngo_${Date.now()}@example.com`, password: 'password123', role: 'ngo' }
  10 |         });
  11 |         
  12 |         // If it's rate limited, it might fail in tests, but we assume fresh IP for test run or we just expect 429
  13 |         if (registerRes.status() === 429) {
  14 |             console.log('Skipping due to rate limit');
  15 |             return;
  16 |         }
  17 | 
> 18 |         const body = await registerRes.json();
     |                      ^ SyntaxError: Unexpected token '<', "
  19 |         const token = body.data?.tokens?.accessToken;
  20 |         
  21 |         if (!token) return; // Might be missing if mock fails, skip
  22 | 
  23 |         // 1. Get Presigned URL
  24 |         const urlRes = await request.post('http://localhost:3000/api/ngo/upload-url', {
  25 |             headers: { 'Authorization': `Bearer ${token}` },
  26 |             data: { filename: 'malware.png', mimeType: 'image/png' }
  27 |         });
  28 |         if (!urlRes.ok()) {
  29 |             const body = await urlRes.text();
  30 |             console.log('Failed to get URL:', urlRes.status(), body);
  31 |         }
  32 |         expect(urlRes.ok()).toBeTruthy();
  33 |         const urlData = await urlRes.json();
  34 |         const { uploadUrl, key } = urlData.data;
  35 | 
  36 |         // 2. Upload fake executable (MZ header)
  37 |         // MZ header: 4D 5A
  38 |         const maliciousBuffer = Buffer.alloc(100);
  39 |         maliciousBuffer.write('MZ\x90\x00\x03\x00\x00\x00', 0, 'binary');
  40 | 
  41 |         try {
  42 |             await request.put(uploadUrl, {
  43 |                 data: maliciousBuffer,
  44 |                 headers: { 'Content-Type': 'image/png' }
  45 |             });
  46 |         } catch (e) {
  47 |             // Expected to fail because we are using a dummy R2 endpoint in dev
  48 |             console.log('Dummy upload failed (expected for dummy R2 URL):', e.message);
  49 |         }
  50 | 
  51 |         // The PUT might succeed or fail depending on R2 configuration
  52 |         
  53 |         // 3. Confirm & Validate
  54 |         const confirmRes = await request.post('http://localhost:3000/api/ngo/upload-confirm', {
  55 |             headers: { 'Authorization': `Bearer ${token}` },
  56 |             data: { key }
  57 |         });
  58 | 
  59 |         expect(confirmRes.status()).toBe(400);
  60 |         const confirmData = await confirmRes.json();
  61 |         
  62 |         // Note: Because we are testing locally without real R2 credentials, 
  63 |         // the backend's getObjectBytes call will fail with a network/SSL error.
  64 |         // If real credentials were provided, this would hit the file-type logic and return "Unknown or invalid file type".
  65 |         expect(confirmData.message).toMatch(/Failed to fetch object bytes from R2|Unknown or invalid file type/);
  66 |     });
  67 | });
  68 | 
```