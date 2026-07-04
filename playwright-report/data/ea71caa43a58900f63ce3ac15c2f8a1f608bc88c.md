# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ngo-qa.spec.js >> NGO Registration QA - End to End >> 4. Wrong OTP behavior
- Location: tests\ngo-qa.spec.js:68:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('#globalError')
Expected substring: "Incorrect OTP"
Received string:    "⚠️ Please enter all 6 digits."
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('#globalError')
    14 × locator resolved to <div id="globalError" class="text-error text-label-md bg-error-container p-3 rounded-lg mb-4">⚠️ Please enter all 6 digits.</div>
       - unexpected value "⚠️ Please enter all 6 digits."

```

```yaml
- text: ⚠️ Please enter all 6 digits.
```

# Test source

```ts
  1   | const { test, expect } = require('@playwright/test');
  2   | 
  3   | test.describe('NGO Registration QA - End to End', () => {
  4   | 
  5   |   test('1. Valid Registration Flow', async ({ page }) => {
  6   |     // Mock the send OTP endpoint
  7   |     await page.route('**/api/auth/verify/send', async route => {
  8   |       await route.fulfill({ status: 200, json: { message: 'OTP sent' } });
  9   |     });
  10  |     // Mock the confirm OTP endpoint
  11  |     await page.route('**/api/auth/verify/confirm', async route => {
  12  |       await route.fulfill({ status: 200, json: { data: { emailVerified: true } } });
  13  |     });
  14  |     // Mock register endpoint
  15  |     await page.route('**/api/auth/register', async route => {
  16  |       await route.fulfill({ status: 200, json: { data: { user: { role: 'ngo' }, tokens: { accessToken: '123' } } } });
  17  |     });
  18  | 
  19  |     await page.goto('/1_NGO_Registration_Step_1.html');
  20  |     
  21  |     await page.fill('#ngoName', 'Valid NGO');
  22  |     await page.fill('#ngoRegNum', 'REG1234');
  23  |     await page.fill('#emailInput', 'validngo@example.com');
  24  |     await page.fill('#contactName', 'John Director');
  25  |     await page.fill('#contactDesignation', 'Director');
  26  |     await page.fill('#mobile', '1234567890');
  27  |     await page.fill('#pwd', 'StrongPass123!');
  28  |     await page.fill('#confirmPwd', 'StrongPass123!');
  29  |     
  30  |     // Verify email
  31  |     await page.click('#verifyEmailBtn', { force: true });
  32  |     await expect(page.locator('#otpSection')).toBeVisible();
  33  |     
  34  |     const otpInputs = page.locator('.otp-input');
  35  |     for(let i=0; i<6; i++) {
  36  |         await otpInputs.nth(i).fill('1');
  37  |     }
  38  |     await page.click('#verifyOtpBtn', { force: true });
  39  |     await expect(page.locator('#successBadge')).toBeVisible();
  40  |     
  41  |     // Continue
  42  |     await page.click('button:has-text("Continue")', { force: true });
  43  |     await expect(page).toHaveURL(/.*2_NGO_Registration_Step_2.*/);
  44  |   });
  45  | 
  46  |   test('2. Missing required fields', async ({ page }) => {
  47  |     await page.goto('/1_NGO_Registration_Step_1.html');
  48  |     
  49  |     // Try submit without filling fields
  50  |     await page.evaluate(() => document.getElementById('continueBtn').disabled = false);
  51  |     await page.click('button:has-text("Continue")', { force: true });
  52  |     
  53  |     const err = page.locator('#globalError');
  54  |     await expect(err).toBeVisible();
  55  |     await expect(err).toContainText('Please fill in all required fields');
  56  |   });
  57  | 
  58  |   test('3. Invalid email format', async ({ page }) => {
  59  |     await page.goto('/1_NGO_Registration_Step_1.html');
  60  |     await page.fill('#emailInput', 'not-an-email');
  61  |     await page.click('#verifyEmailBtn', { force: true });
  62  |     
  63  |     const err = page.locator('#globalError');
  64  |     await expect(err).toBeVisible();
  65  |     await expect(err).toContainText('Please enter a valid email address');
  66  |   });
  67  | 
  68  |   test('4. Wrong OTP behavior', async ({ page }) => {
  69  |     page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  70  |     page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  71  | 
  72  |     await page.route('**/api/auth/verify/send', async route => {
  73  |       await route.fulfill({ status: 200, json: { message: 'OTP sent' } });
  74  |     });
  75  |     await page.route('**/api/auth/verify/confirm', async route => {
  76  |       if (route.request().method() === 'OPTIONS') {
  77  |         await route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  78  |       } else {
  79  |         await route.fulfill({ status: 400, json: { message: 'Incorrect OTP. Please try again.' }, headers: { 'Access-Control-Allow-Origin': '*' } });
  80  |       }
  81  |     });
  82  | 
  83  |     await page.goto('/1_NGO_Registration_Step_1.html');
  84  |     page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  85  |     page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  86  |     await page.fill('#emailInput', 'test@ngo.com');
  87  |     await page.click('#verifyEmailBtn', { force: true });
  88  |     
  89  |     await expect(page.locator('#otpSection')).toBeVisible();
  90  | 
  91  |     const otpInputs = page.locator('.otp-input');
  92  |     for(let i=0; i<6; i++) {
  93  |         await otpInputs.nth(i).fill('0');
  94  |     }
  95  |     await page.evaluate(() => document.getElementById('verifyOtpBtn').click());
  96  |     
  97  |     const err = page.locator('#globalError');
  98  |     await expect(err).toBeVisible();
> 99  |     await expect(err).toContainText('Incorrect OTP');
      |                       ^ Error: expect(locator).toContainText(expected) failed
  100 |     await expect(page.locator('#successBadge')).toBeHidden();
  101 |   });
  102 | 
  103 |   test('5. Large document uploads / Invalid file types', async ({ page }) => {
  104 |     await page.goto('/4_NGO_Registration_Step_4.html');
  105 |     
  106 |     const fileInput = page.locator('#fileInput');
  107 |     
  108 |     // Create an invalid file type buffer
  109 |     const invalidBuffer = Buffer.alloc(1024);
  110 |     await fileInput.setInputFiles({
  111 |         name: 'test.exe',
  112 |         mimeType: 'application/x-msdownload',
  113 |         buffer: invalidBuffer
  114 |     });
  115 |     
  116 |     let err = page.locator('#globalError');
  117 |     await expect(err).toBeVisible();
  118 |     await expect(err).toContainText('has unsupported type');
  119 |     
  120 |     // Create a large file > 10MB
  121 |     const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
  122 |     await fileInput.setInputFiles({
  123 |         name: 'large.pdf',
  124 |         mimeType: 'application/pdf',
  125 |         buffer: largeBuffer
  126 |     });
  127 |     
  128 |     await expect(err).toBeVisible();
  129 |     await expect(err).toContainText('exceeds 10MB limit');
  130 |   });
  131 | 
  132 |   test('6. Terms checkbox not selected', async ({ page }) => {
  133 |     await page.goto('/5_NGO_Registration_Step_5.html');
  134 |     
  135 |     const submitBtn = page.locator('button', { hasText: /Submit Registration/i }).first();
  136 |     await expect(submitBtn).toBeDisabled();
  137 |     
  138 |     const checkboxes = page.locator('input[type="checkbox"]');
  139 |     const count = await checkboxes.count();
  140 |     for(let i = 0; i < count; i++) {
  141 |         await checkboxes.nth(i).check();
  142 |     }
  143 |     await expect(submitBtn).toBeEnabled();
  144 |   });
  145 | });
  146 | 
```