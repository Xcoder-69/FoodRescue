# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: volunteer-qa.spec.js >> Volunteer Registration QA >> Complete Registration Flow
- Location: tests\volunteer-qa.spec.js:12:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button:has-text("Processing..."), button:has-text("Registration Sent!")')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('button:has-text("Processing..."), button:has-text("Registration Sent!")')
    - waiting for" http://localhost:3005/9_volunteer_dashboard" navigation to finish...
    - navigated to "http://localhost:3005/9_volunteer_dashboard"

```

```yaml
- main:
  - text: restaurant
  - heading "Welcome Back" [level=1]
  - paragraph: Login to your account
  - text: Email Address mail
  - textbox "name@example.com"
  - text: Password lock
  - textbox "••••••••"
  - button "visibility"
  - button "Forgot Password?"
  - button "Continue arrow_forward"
  - paragraph:
    - text: Don't have an account?
    - link "Join free":
      - /url: 2_role_selection.html
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test.describe('Volunteer Registration QA', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/');
  6  |     await page.evaluate(() => {
  7  |       window.localStorage.setItem('foodRescueToken', 'fake-token-123');
  8  |       window.localStorage.setItem('foodRescueUser', JSON.stringify({ role: 'volunteer' }));
  9  |     });
  10 |   });
  11 | 
  12 |   test('Complete Registration Flow', async ({ page }) => {
  13 |     // Intercept API calls
  14 |     await page.route('**/api/auth/register', async route => {
  15 |       if (route.request().method() === 'OPTIONS') {
  16 |         await route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': '*' } });
  17 |       } else {
  18 |         await route.fulfill({
  19 |           status: 200,
  20 |           json: {
  21 |             message: 'Volunteer registered successfully',
  22 |             tokens: { accessToken: 'mockToken' },
  23 |             user: { id: 1, role: 'volunteer' }
  24 |           },
  25 |           headers: {
  26 |             'Access-Control-Allow-Origin': '*'
  27 |           }
  28 |         });
  29 |       }
  30 |     });
  31 |     page.on('dialog', dialog => {
  32 |       console.log('DIALOG OPENED:', dialog.message());
  33 |       dialog.accept();
  34 |     });
  35 |     page.on('console', msg => console.log('VOLUNTEER PAGE LOG:', msg.text()));
  36 |     page.on('pageerror', err => console.log('VOLUNTEER PAGE ERROR:', err.message));
  37 |     
  38 |     await page.goto('/6_volunteer_registration.html');
  39 | 
  40 |     // Fill form
  41 |     await page.fill('#vol-name', 'Test Volunteer');
  42 |     await page.fill('#vol-phone', '+1234567890');
  43 |     await page.fill('#vol-email', 'volunteer@example.com');
  44 |     await page.fill('#vol-password', 'password123');
  45 |     await page.fill('#vol-confirm-password', 'password123');
  46 | 
  47 |     // Select vehicle type
  48 |     await page.selectOption('select', 'car');
  49 | 
  50 |     // Check location
  51 |     await page.evaluate(() => {
  52 |       const btn = document.getElementById('mainContinueBtn');
  53 |       btn.disabled = false;
  54 |       btn.classList.remove('opacity-50', 'cursor-not-allowed');
  55 |     });
  56 |     await page.dispatchEvent('#mainContinueBtn', 'click');
  57 | 
  58 |     // Expect button to change to 'Processing...' or 'Registration Sent!'
  59 |     await page.waitForTimeout(500);
  60 |     const submitBtn = page.locator('button:has-text("Processing..."), button:has-text("Registration Sent!")');
> 61 |     await expect(submitBtn).toBeVisible({ timeout: 5000 });
     |                             ^ Error: expect(locator).toBeVisible() failed
  62 |   });
  63 | 
  64 |   test('Missing Required Fields', async ({ page }) => {
  65 |     await page.goto('/6_volunteer_registration.html');
  66 |     
  67 |     // HTML5 Validation kicks in because of 'required' attributes on #vol-name and #vol-email
  68 |     const submitBtn = page.locator('button:has-text("Submit For Verification")');
  69 |     await page.evaluate(() => document.getElementById('mainContinueBtn').disabled = false);
  70 |     await submitBtn.click();
  71 |     
  72 |     // Validate that it did NOT say "Processing..."
  73 |     await expect(submitBtn).toHaveText('Submit For Verification');
  74 |   });
  75 | });
  76 | 
```