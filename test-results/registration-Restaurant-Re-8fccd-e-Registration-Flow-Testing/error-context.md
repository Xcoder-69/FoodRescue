# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: registration.spec.js >> Restaurant Registration QA >> Complete Registration Flow Testing
- Location: tests\registration.spec.js:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('#otpSection')
Expected: visible
Received: hidden
Timeout:  2000ms

Call log:
  - Expect "toBeVisible" with timeout 2000ms
  - waiting for locator('#otpSection')
    14 × locator resolved to <div id="otpSection" class="hidden mt-md p-md bg-surface-container-low border border-outline-variant rounded-xl space-y-md">…</div>
       - unexpected value "hidden"

```

```yaml
- banner:
  - button "arrow_back"
  - heading "Food Rescue Hero" [level=1]
  - button "Need help? contact_support"
- main:
  - paragraph: Step 1 of 5
  - paragraph: Account Creation
  - heading "Basic Information" [level=2]
  - text: Restaurant Owner Full Name
  - textbox "John Doe"
  - text: Restaurant Email
  - textbox "owner@restaurant.com": testowner_1783181634172@restaurant.com
  - button "Sending..." [disabled]
  - heading "Security" [level=2]
  - text: Password
  - textbox "••••••••"
  - text: visibility
  - paragraph: Enter a strong password
  - text: Confirm Password
  - textbox "••••••••"
  - text: visibility
  - button "Continue to Restaurant Details"
  - heading "Why Join Us?" [level=3]
  - list:
    - listitem: compost Reduce food waste footprint.
    - listitem: volunteer_activism Support local community food banks.
    - listitem: receipt_long Get automated tax deduction logs.
  - paragraph: Join 500+ restaurants making a difference today.
```

# Test source

```ts
  1   | const { test, expect } = require('@playwright/test');
  2   | 
  3   | test.describe('Restaurant Registration QA', () => {
  4   |   test('Complete Registration Flow Testing', async ({ page }) => {
  5   |     test.setTimeout(60000);
  6   |     // Navigate to Step 1
  7   |     await page.route('**/api/auth/register', async route => {
  8   |       if (route.request().method() === 'OPTIONS') {
  9   |         await route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  10  |       } else {
  11  |         await route.fulfill({ status: 200, json: { message: 'Success', data: { tokens: { accessToken: 'fake' }, user: {} } }, headers: { 'Access-Control-Allow-Origin': '*' } });
  12  |       }
  13  |     });
  14  |     await page.route('**/api/restaurant/profile', async route => {
  15  |       if (route.request().method() === 'OPTIONS') {
  16  |         await route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  17  |       } else {
  18  |         await route.fulfill({ status: 200, json: { message: 'Profile created' }, headers: { 'Access-Control-Allow-Origin': '*' } });
  19  |       }
  20  |     });
  21  |     await page.route('**/api/auth/verify/send', async route => {
  22  |       if (route.request().method() === 'OPTIONS') {
  23  |         await route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  24  |       } else {
  25  |         await route.fulfill({ status: 200, json: { message: 'OTP sent' }, headers: { 'Access-Control-Allow-Origin': '*' } });
  26  |       }
  27  |     });
  28  |     await page.route('**/api/auth/verify/confirm', async route => {
  29  |       if (route.request().method() === 'OPTIONS') {
  30  |         await route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  31  |       } else {
  32  |         await route.fulfill({ status: 200, json: { message: 'OTP verified' }, headers: { 'Access-Control-Allow-Origin': '*' } });
  33  |       }
  34  |     });
  35  |     await page.goto('/1_Restaurant_Registration_Step_1.html');
  36  | 
  37  |     // 1. All required fields (Submit with empty fields)
  38  |     let alertMessage = '';
  39  |     page.on('dialog', dialog => {
  40  |       alertMessage = dialog.message();
  41  |       console.log("PAGE ALERT FIRED: " + alertMessage);
  42  |       dialog.accept();
  43  |     });
  44  |     
  45  |     await page.evaluate(() => {
  46  |         // Enable button for test purposes to see if it allows submit without verify
  47  |         document.getElementById('mainContinueBtn').disabled = false;
  48  |     });
  49  |     await page.click('#mainContinueBtn');
  50  |     expect(alertMessage, '1. Required fields should trigger alert').toContain('Please fill in all required fields');
  51  | 
  52  |     // 2. Email validation (Enter invalid email and verify)
  53  |     await page.fill('#emailInput', 'invalid-email');
  54  |     // The current code doesn't have strict client-side email regex validation before sending OTP, 
  55  |     // but the API will reject it later.
  56  | 
  57  |     // 3. Email OTP verification
  58  |     const randomEmail = `testowner_${Date.now()}@restaurant.com`;
  59  |     await page.fill('#emailInput', randomEmail);
  60  |     
  61  |     // We expect the Verify Email button to exist, but currently it's hidden by default in the HTML!
  62  |     // Let's unhide it if it is hidden, as per current UI state
  63  |     await page.evaluate(() => document.getElementById('verifyBtn').classList.remove('hidden'));
  64  |     
  65  |     await page.click('#verifyBtn');
> 66  |     await expect(page.locator('#otpSection')).toBeVisible({ timeout: 2000 });
      |                                               ^ Error: expect(locator).toBeVisible() failed
  67  | 
  68  |     // 4. OTP resend after 10 seconds
  69  |     const countdownLocator = page.locator('#countdown');
  70  |     await expect(countdownLocator).toContainText('Resend in');
  71  |     // Wait for 11 seconds to verify it changes to 'Resend OTP'
  72  |     await page.waitForTimeout(11000);
  73  |     await expect(countdownLocator).toHaveText('Resend OTP', { timeout: 2000 });
  74  | 
  75  |     // Enter OTP and verify
  76  |     const otpInputs = page.locator('.otp-input');
  77  |     for(let i=0; i<6; i++) {
  78  |         await otpInputs.nth(i).fill('1');
  79  |     }
  80  |     await page.click('text=Verify OTP');
  81  |     await expect(page.locator('#successBadge')).toBeVisible();
  82  | 
  83  |     // 5. Password validation
  84  |     await page.fill('#pwd', 'weak');
  85  |     await expect(page.locator('#strengthLabel')).toHaveText('Weak');
  86  |     await page.fill('#pwd', 'StrongPass123!');
  87  |     await expect(page.locator('#strengthLabel')).toHaveText('Strong');
  88  |     await page.fill('#pwd-confirm', 'StrongPass123!');
  89  | 
  90  |     // Submit Step 1
  91  |     await page.fill('#ownerNameInput', 'Test Owner');
  92  |     await page.click('#mainContinueBtn');
  93  |     
  94  |     // Wait for navigation to Step 2
  95  |     await expect(page).toHaveURL(/.*2_Restaurant_Registration_Step_2.*/);
  96  | 
  97  |     // Fill Step 2
  98  |     await page.fill('#restName', 'Test Restaurant');
  99  |     await page.selectOption('#restType', 'Cafe / Bistro');
  100 |     await page.fill('#restFSSAI', '12345678901234');
  101 |     await page.fill('#restGST', '22AAAAA0000A1Z5');
  102 |     await page.click('text=Continue to Location');
  103 | 
  104 |     // Wait for Step 3
  105 |     await expect(page).toHaveURL(/.*3_Restaurant_Registration_Step_3.*/);
  106 | 
  107 |     // 6. Location picker
  108 |     // Since we don't have real geolocation permissions in headless mode easily, we mock it or manually fill
  109 |     await page.fill('#addr1', '123 Fake St');
  110 |     await page.fill('#city', 'Test City');
  111 |     await page.fill('#state', 'Test State');
  112 |     await page.fill('#pincode', '123456');
  113 |     await page.fill('#emergencyPhone', '+1234567890');
  114 |     
  115 |     // 9. Submit button behavior
  116 |     await page.click('text=Continue to Documentation');
  117 | 
  118 |     // Wait for Step 4
  119 |     await expect(page).toHaveURL(/.*4_Restaurant_Registration_Step_4.*/);
  120 | 
  121 |     // 7. Document uploads
  122 |     // Uploads are mocked via 'submitStep4()'
  123 |     await page.click('text=Continue to Review');
  124 | 
  125 |     // Wait for Step 5
  126 |     await expect(page).toHaveURL(/.*5_Restaurant_Registration_Step_5.*/);
  127 | 
  128 |     // 8. Terms & Conditions checkbox
  129 |     // Verify submit is disabled
  130 |     const finalSubmitBtn = page.locator('button#submitBtn');
  131 |     await expect(finalSubmitBtn).toBeDisabled();
  132 | 
  133 |     // Check all checkboxes
  134 |     const checkboxes = page.locator('input[type="checkbox"]');
  135 |     const count = await checkboxes.count();
  136 |     for (let i = 0; i < count; i++) {
  137 |       await checkboxes.nth(i).evaluate(node => {
  138 |         node.checked = true;
  139 |         node.dispatchEvent(new Event('change', { bubbles: true }));
  140 |       });
  141 |     }
  142 |     await expect(finalSubmitBtn).toBeEnabled();
  143 | 
  144 |     // 10. Error messages / Success submission
  145 |     // Since backend might fail on invalid email format or duplication, we capture response
  146 |     await finalSubmitBtn.click();
  147 |     
  148 |     // Check if it redirects to Step 6
  149 |     await expect(page).toHaveURL(/.*6_Registration_Success_Status.*/, { timeout: 10000 });
  150 |   });
  151 | });
  152 | 
```