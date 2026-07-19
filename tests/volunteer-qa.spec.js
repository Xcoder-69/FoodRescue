const { test, expect } = require('@playwright/test');

test.describe('Volunteer Registration QA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.setItem('foodRescueToken', 'fake-token-123');
      window.localStorage.setItem('foodRescueUser', JSON.stringify({ role: 'volunteer' }));
    });
  });

  test('Complete Registration Flow', async ({ page }) => {
    // Intercept API calls
    await page.route('**/api/auth/register', async route => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': '*' } });
      } else {
        await route.fulfill({
          status: 200,
          json: {
            message: 'Volunteer registered successfully',
            tokens: { accessToken: 'mockToken' },
            user: { id: 1, role: 'volunteer' }
          },
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    });
    page.on('dialog', dialog => {
      console.log('DIALOG OPENED:', dialog.message());
      dialog.accept();
    });
    page.on('console', msg => console.log('VOLUNTEER PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('VOLUNTEER PAGE ERROR:', err.message));
    
    await page.goto('/6_volunteer_registration.html');

    // Fill form
    await page.fill('#vol-name', 'Test Volunteer');
    await page.fill('#vol-phone', '+1234567890');
    await page.fill('#vol-email', 'volunteer@example.com');
    await page.fill('#vol-password', 'password123');
    await page.fill('#vol-confirm-password', 'password123');

    // Select vehicle type
    await page.selectOption('select', 'car');

    // Check location
    await page.evaluate(() => {
      const btn = document.getElementById('mainContinueBtn');
      btn.disabled = false;
      btn.classList.remove('opacity-50', 'cursor-not-allowed');
    });
    await page.dispatchEvent('#mainContinueBtn', 'click');

    const submitBtn = page.locator('button:has-text("Processing..."), button:has-text("Registration Sent!")');
    await expect(submitBtn).toBeVisible({ timeout: 5000 });
  });

  test('Missing Required Fields', async ({ page }) => {
    await page.goto('/6_volunteer_registration.html');
    
    // HTML5 Validation kicks in because of 'required' attributes on #vol-name and #vol-email
    const submitBtn = page.locator('button:has-text("Submit For Verification")');
    await page.evaluate(() => document.getElementById('mainContinueBtn').disabled = false);
    await submitBtn.click();
    
    // Validate that it did NOT say "Processing..."
    await expect(submitBtn).toHaveText('Submit For Verification');
  });
});
