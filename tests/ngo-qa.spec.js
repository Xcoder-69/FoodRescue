const { test, expect } = require('@playwright/test');

test.describe('NGO Registration QA - End to End', () => {

  test('1. Valid Registration Flow', async ({ page }) => {
    // Mock the send OTP endpoint
    await page.route('**/api/auth/verify/send', async route => {
      await route.fulfill({ status: 200, json: { message: 'OTP sent' } });
    });
    // Mock the confirm OTP endpoint
    await page.route('**/api/auth/verify/confirm', async route => {
      await route.fulfill({ status: 200, json: { data: { emailVerified: true } } });
    });
    // Mock register endpoint
    await page.route('**/api/auth/register', async route => {
      await route.fulfill({ status: 200, json: { data: { user: { role: 'ngo' }, tokens: { accessToken: '123' } } } });
    });

    await page.goto('/1_NGO_Registration_Step_1.html');
    
    await page.fill('#ngoName', 'Valid NGO');
    await page.fill('#ngoRegNum', 'REG1234');
    await page.fill('#emailInput', 'validngo@example.com');
    await page.fill('#contactName', 'John Director');
    await page.fill('#contactDesignation', 'Director');
    await page.fill('#mobile', '1234567890');
    await page.fill('#pwd', 'StrongPass123!');
    await page.fill('#confirmPwd', 'StrongPass123!');
    
    // Verify email
    await page.click('#verifyEmailBtn', { force: true });
    await expect(page.locator('#otpSection')).toBeVisible();
    
    const otpInputs = page.locator('.otp-input');
    for(let i=0; i<6; i++) {
        await otpInputs.nth(i).fill('1');
    }
    await page.click('#verifyOtpBtn', { force: true });
    await expect(page.locator('#successBadge')).toBeVisible();
    
    // Continue
    await page.click('button:has-text("Continue")', { force: true });
    await expect(page).toHaveURL(/.*2_NGO_Registration_Step_2.*/);
  });

  test('2. Missing required fields', async ({ page }) => {
    await page.goto('/1_NGO_Registration_Step_1.html');
    
    // Try submit without filling fields
    await page.evaluate(() => document.getElementById('continueBtn').disabled = false);
    await page.click('button:has-text("Continue")', { force: true });
    
    const err = page.locator('#globalError');
    await expect(err).toBeVisible();
    await expect(err).toContainText('Please fill in all required fields');
  });

  test('3. Invalid email format', async ({ page }) => {
    await page.goto('/1_NGO_Registration_Step_1.html');
    await page.fill('#emailInput', 'not-an-email');
    await page.click('#verifyEmailBtn', { force: true });
    
    const err = page.locator('#globalError');
    await expect(err).toBeVisible();
    await expect(err).toContainText('Please enter a valid email address');
  });

  test('4. Wrong OTP behavior', async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    await page.route('**/api/auth/verify/send', async route => {
      await route.fulfill({ status: 200, json: { message: 'OTP sent' } });
    });
    await page.route('**/api/auth/verify/confirm', async route => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
      } else {
        await route.fulfill({ status: 400, json: { message: 'Incorrect OTP. Please try again.' }, headers: { 'Access-Control-Allow-Origin': '*' } });
      }
    });

    await page.goto('/1_NGO_Registration_Step_1.html');
    await page.fill('#emailInput', 'test@ngo.com');
    await page.click('#verifyEmailBtn', { force: true });
    
    await expect(page.locator('#otpSection')).toBeVisible();

    const otpInputs = page.locator('.otp-input');
    for(let i=0; i<6; i++) {
        await otpInputs.nth(i).fill('0');
    }
    await page.click('#verifyOtpBtn', { force: true });
    
    const err = page.locator('#globalError');
    await expect(err).toBeVisible();
    await expect(err).toContainText('Incorrect OTP');
    await expect(page.locator('#successBadge')).toBeHidden();
  });

  test('5. Large document uploads / Invalid file types', async ({ page }) => {
    await page.goto('/4_NGO_Registration_Step_4.html');
    
    const fileInput = page.locator('#fileInput');
    
    // Create an invalid file type buffer
    const invalidBuffer = Buffer.alloc(1024);
    await fileInput.setInputFiles({
        name: 'test.exe',
        mimeType: 'application/x-msdownload',
        buffer: invalidBuffer
    });
    
    let err = page.locator('#globalError');
    await expect(err).toBeVisible();
    await expect(err).toContainText('has unsupported type');
    
    // Create a large file > 10MB
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
    await fileInput.setInputFiles({
        name: 'large.pdf',
        mimeType: 'application/pdf',
        buffer: largeBuffer
    });
    
    await expect(err).toBeVisible();
    await expect(err).toContainText('exceeds 10MB limit');
  });

  test('6. Terms checkbox not selected', async ({ page }) => {
    await page.goto('/5_NGO_Registration_Step_5.html');
    
    const submitBtn = page.locator('button:has-text("Submit Registration")');
    await expect(submitBtn).toBeDisabled();
    
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    for(let i = 0; i < count; i++) {
        await checkboxes.nth(i).check();
    }
    await expect(submitBtn).toBeEnabled();
  });
});
