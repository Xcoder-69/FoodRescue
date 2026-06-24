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
  13 |     await page.route('**/api/auth/register', async route => {
  14 |       if (route.request().method() === 'OPTIONS') {
  15 |         await route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  16 |       } else {
  17 |         await route.fulfill({ status: 200, json: { message: 'Success', data: { tokens: { accessToken: 'fake' }, user: {} } }, headers: { 'Access-Control-Allow-Origin': '*' } });
  18 |       }
  19 |     });
  20 |     await page.goto('/6_volunteer_registration.html');
  21 | 
  22 |     // Fill form
  23 |     await page.fill('#vol-name', 'Test Volunteer');
  24 |     await page.fill('#vol-phone', '+1234567890');
  25 |     await page.fill('#vol-email', 'volunteer@example.com');
  26 | 
  27 |     // Select vehicle type
  28 |     await page.selectOption('select', 'car');
  29 | 
  30 |     // Check location
  31 |     await page.click('button:has-text("Submit For Verification")');
  32 | 
  33 |     // Intercept alert if registration fails
  34 |     page.on('dialog', dialog => dialog.accept());
  35 | 
  36 |     // Expect button to change to 'Processing...' or 'Registration Sent!'
  37 |     const submitBtn = page.locator('button:has-text("Processing..."), button:has-text("Registration Sent!")');
> 38 |     await expect(submitBtn).toBeVisible({ timeout: 5000 });
     |                             ^ Error: expect(locator).toBeVisible() failed
  39 |   });
  40 | 
  41 |   test('Missing Required Fields', async ({ page }) => {
  42 |     await page.goto('/6_volunteer_registration.html');
  43 |     
  44 |     // HTML5 Validation kicks in because of 'required' attributes on #vol-name and #vol-email
  45 |     const submitBtn = page.locator('button:has-text("Submit For Verification")');
  46 |     await submitBtn.click();
  47 |     
  48 |     // Validate that it did NOT say "Processing..."
  49 |     await expect(submitBtn).toHaveText('Submit For Verification');
  50 |   });
  51 | });
  52 | 
```