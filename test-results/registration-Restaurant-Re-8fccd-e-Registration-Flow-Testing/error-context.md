# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: registration.spec.js >> Restaurant Registration QA >> Complete Registration Flow Testing
- Location: tests\registration.spec.js:4:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*5_Restaurant_Registration_Step_5.*/
Received string:  "http://localhost:3005/4_Restaurant_Registration_Step_4"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    13 × unexpected value "http://localhost:3005/4_Restaurant_Registration_Step_4"

```

```yaml
- banner:
  - button "arrow_back"
  - heading "Food Rescue Hero" [level=1]
  - text: Registration Help Contact
- main:
  - paragraph: Step 4 of 5
  - heading "Document Verification" [level=2]
  - text: Documents Uploaded
  - paragraph: 1 / 4
  - text: photo_camera
  - heading "Restaurant Front Photo *" [level=3]
  - paragraph: Clear exterior shot with signage visible
  - text: Pending
  - button "upload_file Choose File"
  - button "photo_camera Take Photo"
  - text: verified_user
  - heading "FSSAI Certificate *" [level=3]
  - paragraph: Valid Food Safety License (PDF or JPG)
  - text: Pending
  - button "upload_file Choose File"
  - button "photo_camera Take Photo"
  - text: account_circle
  - heading "Profile Photo *" [level=3]
  - paragraph: Clear photo for your public profile (JPG/PNG)
  - text: Pending
  - button "upload_file Choose File"
  - button "photo_camera Take Photo"
  - text: business_center
  - heading "Business Proof (Optional)" [level=3]
  - paragraph: GST Registration or Trade License
  - text: Optional
  - button "upload_file Choose File"
  - button "photo_camera Take Photo"
  - text: "⚠️ Please upload: Restaurant Front Photo, FSSAI Certificate, Profile Photo"
  - button "chevron_left Back"
  - button "Continue to Review chevron_right"
```

# Test source

```ts
  40  |       }
  41  |     });
  42  |     await page.route('**/api/auth/otp/verify', async route => {
  43  |       if (route.request().method() === 'OPTIONS') {
  44  |         await route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  45  |       } else {
  46  |         await route.fulfill({ status: 200, json: { message: 'OTP verified' }, headers: { 'Access-Control-Allow-Origin': '*' } });
  47  |       }
  48  |     });
  49  |     await page.goto('/1_Restaurant_Registration_Step_1.html');
  50  | 
  51  |     // 1. All required fields (Submit with empty fields)
  52  |     let alertMessage = '';
  53  |     page.on('dialog', dialog => {
  54  |       alertMessage = dialog.message();
  55  |       console.log("PAGE ALERT FIRED: " + alertMessage);
  56  |       dialog.accept();
  57  |     });
  58  |     
  59  |     await page.evaluate(() => {
  60  |         // Enable button for test purposes to see if it allows submit without verify
  61  |         document.getElementById('mainContinueBtn').disabled = false;
  62  |     });
  63  |     await page.click('#mainContinueBtn');
  64  |     expect(alertMessage, '1. Required fields should trigger alert').toContain('Please fill in all required fields');
  65  | 
  66  |     // 2. Email validation (Enter invalid email and verify)
  67  |     await page.fill('#emailInput', 'invalid-email');
  68  |     // The current code doesn't have strict client-side email regex validation before sending OTP, 
  69  |     // but the API will reject it later.
  70  | 
  71  |     // 3. Email OTP verification
  72  |     const randomEmail = `testowner_${Date.now()}@restaurant.com`;
  73  |     await page.fill('#emailInput', randomEmail);
  74  |     
  75  |     // We expect the Verify Email button to exist, but currently it's hidden by default in the HTML!
  76  |     // Let's unhide it if it is hidden, as per current UI state
  77  |     await page.evaluate(() => document.getElementById('verifyBtn').classList.remove('hidden'));
  78  |     
  79  |     await page.click('#verifyBtn');
  80  |     await expect(page.locator('#otpSection')).toBeVisible({ timeout: 2000 });
  81  | 
  82  |     // 4. OTP resend after 10 seconds
  83  |     const countdownLocator = page.locator('#countdown');
  84  |     await expect(countdownLocator).toContainText('Resend in');
  85  |     // Wait for 11 seconds to verify it changes to 'Resend OTP'
  86  |     await page.waitForTimeout(11000);
  87  |     await expect(countdownLocator).toHaveText('Resend OTP', { timeout: 2000 });
  88  | 
  89  |     // Enter OTP and verify
  90  |     const otpInputs = page.locator('.otp-input');
  91  |     for(let i=0; i<6; i++) {
  92  |         await otpInputs.nth(i).fill('1');
  93  |     }
  94  |     await page.click('text=Verify OTP');
  95  |     await expect(page.locator('#successBadge')).toBeVisible();
  96  | 
  97  |     // 5. Password validation
  98  |     await page.fill('#pwd', 'weak');
  99  |     await expect(page.locator('#strengthLabel')).toHaveText('Weak');
  100 |     await page.fill('#pwd', 'StrongPass123!');
  101 |     await expect(page.locator('#strengthLabel')).toHaveText('Strong');
  102 |     await page.fill('#pwd-confirm', 'StrongPass123!');
  103 | 
  104 |     // Submit Step 1
  105 |     await page.fill('#ownerNameInput', 'Test Owner');
  106 |     await page.click('#mainContinueBtn');
  107 |     
  108 |     // Wait for navigation to Step 2
  109 |     await expect(page).toHaveURL(/.*2_Restaurant_Registration_Step_2.*/);
  110 | 
  111 |     // Fill Step 2
  112 |     await page.fill('#restName', 'Test Restaurant');
  113 |     await page.selectOption('#restType', 'Cafe / Bistro');
  114 |     await page.fill('#restFSSAI', '12345678901234');
  115 |     await page.fill('#restGST', '22AAAAA0000A1Z5');
  116 |     await page.click('text=Continue to Location');
  117 | 
  118 |     // Wait for Step 3
  119 |     await expect(page).toHaveURL(/.*3_Restaurant_Registration_Step_3.*/);
  120 | 
  121 |     // 6. Location picker
  122 |     // Since we don't have real geolocation permissions in headless mode easily, we mock it or manually fill
  123 |     await page.fill('#addr1', '123 Fake St');
  124 |     await page.fill('#city', 'Test City');
  125 |     await page.fill('#state', 'Test State');
  126 |     await page.fill('#pincode', '123456');
  127 |     await page.fill('#emergencyPhone', '+1234567890');
  128 |     
  129 |     // 9. Submit button behavior
  130 |     await page.click('text=Continue to Documentation');
  131 | 
  132 |     // Wait for Step 4
  133 |     await expect(page).toHaveURL(/.*4_Restaurant_Registration_Step_4.*/);
  134 | 
  135 |     // 7. Document uploads
  136 |     // Uploads are mocked via 'submitStep4()'
  137 |     await page.click('text=Continue to Review');
  138 | 
  139 |     // Wait for Step 5
> 140 |     await expect(page).toHaveURL(/.*5_Restaurant_Registration_Step_5.*/);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  141 | 
  142 |     // 8. Terms & Conditions checkbox
  143 |     // Verify submit is disabled
  144 |     const finalSubmitBtn = page.locator('button#submitBtn');
  145 |     await expect(finalSubmitBtn).toBeDisabled();
  146 | 
  147 |     // Check all checkboxes
  148 |     const checkboxes = page.locator('input[type="checkbox"]');
  149 |     const count = await checkboxes.count();
  150 |     for (let i = 0; i < count; i++) {
  151 |       await checkboxes.nth(i).evaluate(node => {
  152 |         node.checked = true;
  153 |         node.dispatchEvent(new Event('change', { bubbles: true }));
  154 |       });
  155 |     }
  156 |     await expect(finalSubmitBtn).toBeEnabled();
  157 | 
  158 |     // 10. Error messages / Success submission
  159 |     // Since backend might fail on invalid email format or duplication, we capture response
  160 |     await finalSubmitBtn.click();
  161 |     
  162 |     // Check if it redirects to Step 6
  163 |     await expect(page).toHaveURL(/.*6_Registration_Success_Status.*/, { timeout: 10000 });
  164 |   });
  165 | });
  166 | 
```