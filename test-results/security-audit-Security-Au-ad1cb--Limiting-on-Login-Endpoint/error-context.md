# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security-audit.spec.js >> Security Audit API Tests >> 1. Rate Limiting on Login Endpoint
- Location: tests\security-audit.spec.js:5:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test.describe('Security Audit API Tests', () => {
  4  |     
  5  |     test('1. Rate Limiting on Login Endpoint', async ({ request }) => {
  6  |         const url = 'http://localhost:3000/api/auth/login';
  7  |         
  8  |         let rateLimited = false;
  9  |         // The limit is 5 per 15 minutes, so 10 requests should trigger a 429
  10 |         for (let i = 0; i < 10; i++) {
  11 |             const res = await request.post(url, {
  12 |                 data: { email: 'test@example.com', password: `pass${i}` },
  13 |                 headers: { 'x-test-ip': '127.0.0.10' }
  14 |             });
  15 |             if (res.status() === 429) {
  16 |                 rateLimited = true;
  17 |                 const body = await res.json();
  18 |                 expect(body.error).toContain('Too many requests');
  19 |                 break;
  20 |             }
  21 |         }
  22 |         
> 23 |         expect(rateLimited).toBe(true);
     |                             ^ Error: expect(received).toBe(expected) // Object.is equality
  24 |     });
  25 | 
  26 |     test('2. Rate Limiting on Register Endpoint', async ({ request }) => {
  27 |         const url = 'http://localhost:3000/api/auth/register';
  28 |         
  29 |         let rateLimited = false;
  30 |         for (let i = 0; i < 10; i++) {
  31 |             const res = await request.post(url, {
  32 |                 data: { email: `new${i}@example.com`, password: 'password123' },
  33 |                 headers: { 'x-test-ip': '127.0.0.11' }
  34 |             });
  35 |             if (res.status() === 429) {
  36 |                 rateLimited = true;
  37 |                 break;
  38 |             }
  39 |         }
  40 |         
  41 |         expect(rateLimited).toBe(true);
  42 |     });
  43 | });
  44 | 
```