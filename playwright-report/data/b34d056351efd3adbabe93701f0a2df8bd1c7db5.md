# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ngo-qa.spec.js >> NGO Registration QA - End to End >> 4. Wrong OTP behavior
- Location: tests\ngo-qa.spec.js:68:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('#globalError')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('#globalError')

```

```yaml
- banner:
  - button "arrow_back"
  - heading "Food Rescue Hero" [level=1]
  - text: Registration Help Contact
- main:
  - text: Step 1 of 5 Account Creation
  - heading "Organization Details" [level=2]
  - paragraph: Let's start by creating your official NGO profile.
  - text: NGO Name
  - textbox "e.g. Harvest Relief Foundation"
  - text: NGO Registration Number
  - textbox "Official Reg No."
  - text: Organization Email
  - textbox "verify@ngo.org": test@ngo.com
  - button "Sent!" [disabled]
  - paragraph: Enter the 6-digit code sent to your email.
  - textbox: "0"
  - textbox: "0"
  - textbox: "0"
  - textbox: "0"
  - textbox: "0"
  - textbox: "0"
  - text: Resend in 55s
  - button "Verify OTP"
  - heading "Contact Person" [level=3]
  - text: Full Name
  - textbox "John Doe"
  - text: Designation
  - textbox "e.g. Director"
  - text: Mobile Number +1
  - textbox "123 456 7890"
  - heading "Set Password" [level=3]
  - text: Password
  - textbox "••••••••"
  - text: visibility_off Confirm Password
  - textbox "••••••••"
  - button "Continue arrow_forward" [disabled]
  - button "Save Draft"
- navigation:
  - link "assignment_ind Registration":
    - /url: "#"
  - link "help_outline Help":
    - /url: "#"
  - link "support_agent Contact":
    - /url: "#"
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
  84  |     await page.fill('#emailInput', 'test@ngo.com');
  85  |     await page.click('#verifyEmailBtn', { force: true });
  86  |     
  87  |     await expect(page.locator('#otpSection')).toBeVisible();
  88  | 
  89  |     const otpInputs = page.locator('.otp-input');
  90  |     for(let i=0; i<6; i++) {
  91  |         await otpInputs.nth(i).fill('0');
  92  |     }
  93  |     await page.click('#verifyOtpBtn', { force: true });
  94  |     
  95  |     const err = page.locator('#globalError');
> 96  |     await expect(err).toBeVisible();
      |                       ^ Error: expect(locator).toBeVisible() failed
  97  |     await expect(err).toContainText('Incorrect OTP');
  98  |     await expect(page.locator('#successBadge')).toBeHidden();
  99  |   });
  100 | 
  101 |   test('5. Large document uploads / Invalid file types', async ({ page }) => {
  102 |     await page.goto('/4_NGO_Registration_Step_4.html');
  103 |     
  104 |     const fileInput = page.locator('#fileInput');
  105 |     
  106 |     // Create an invalid file type buffer
  107 |     const invalidBuffer = Buffer.alloc(1024);
  108 |     await fileInput.setInputFiles({
  109 |         name: 'test.exe',
  110 |         mimeType: 'application/x-msdownload',
  111 |         buffer: invalidBuffer
  112 |     });
  113 |     
  114 |     let err = page.locator('#globalError');
  115 |     await expect(err).toBeVisible();
  116 |     await expect(err).toContainText('has unsupported type');
  117 |     
  118 |     // Create a large file > 10MB
  119 |     const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
  120 |     await fileInput.setInputFiles({
  121 |         name: 'large.pdf',
  122 |         mimeType: 'application/pdf',
  123 |         buffer: largeBuffer
  124 |     });
  125 |     
  126 |     await expect(err).toBeVisible();
  127 |     await expect(err).toContainText('exceeds 10MB limit');
  128 |   });
  129 | 
  130 |   test('6. Terms checkbox not selected', async ({ page }) => {
  131 |     await page.goto('/5_NGO_Registration_Step_5.html');
  132 |     
  133 |     const submitBtn = page.locator('button:has-text("Submit Registration")');
  134 |     await expect(submitBtn).toBeDisabled();
  135 |     
  136 |     const checkboxes = page.locator('input[type="checkbox"]');
  137 |     const count = await checkboxes.count();
  138 |     for(let i = 0; i < count; i++) {
  139 |         await checkboxes.nth(i).check();
  140 |     }
  141 |     await expect(submitBtn).toBeEnabled();
  142 |   });
  143 | });
  144 | 
```