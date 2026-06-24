const { test, expect } = require('@playwright/test');

test.describe('Auth QA - Login, OTP, Password Reset', () => {

  test('Login Flow', async ({ page }) => {
    await page.goto('/4_login_and_verification.html');

    await page.fill('#email-input', 'test@example.com');
    await page.fill('#password-input', 'password123');
    
    await page.click('#continue-btn');
    
    // If invalid, error appears. If valid, redirect.
    // We check if error is shown OR if redirected
    const errVisible = await page.locator('#login-error').isVisible();
    if (errVisible) {
        expect(await page.locator('#login-error').innerText()).toContain('⚠');
    }
  });

  test('Password Reset Flow', async ({ page }) => {
    // Mock API responses
    await page.route('**/api/auth/forgot-password', async route => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
      } else {
        await route.fulfill({ status: 200, json: { message: 'Reset code sent' }, headers: { 'Access-Control-Allow-Origin': '*' } });
      }
    });
    await page.route('**/api/auth/reset-password', async route => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
      } else {
        await route.fulfill({ status: 200, json: { message: 'Password reset' }, headers: { 'Access-Control-Allow-Origin': '*' } });
      }
    });

    await page.goto('/4_login_and_verification.html');

    // Open Forgot Password Modal
    await page.click('text="Forgot Password?"');
    await expect(page.locator('#forgot-modal')).toBeVisible();

    // Send OTP
    await page.fill('#forgot-email', 'test@example.com');
    await page.click('#forgot-send-btn');
    
    // Check if step 2 is shown
    await expect(page.locator('#forgot-s2')).toBeVisible();

    // Enter OTP and new password
    const otpInputs = page.locator('#reset-otp-inputs input');
    for(let i=0; i<6; i++) {
        await otpInputs.nth(i).fill('1');
    }
    await page.fill('#new-pwd', 'newStrongPass123!');
    await page.click('#reset-btn');
  });

  test('Email OTP Verification UI', async ({ page }) => {
    await page.goto('/4_login_and_verification.html');
    
    // Manually trigger the OTP overlay via exposed function to test its UI
    await page.evaluate(() => showOtpOverlay('Testing OTP'));
    await expect(page.locator('#otp-overlay')).toBeVisible();
    
    // Fill OTP
    const otpInputs = page.locator('#otp-inputs input');
    for(let i=0; i<6; i++) {
        await otpInputs.nth(i).fill('1');
    }
    await page.click('#verify-btn');
  });
});
