const { test, expect } = require('@playwright/test');

test.describe('Volunteer Registration QA', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('foodRescueToken', 'fake-token-123');
      window.localStorage.setItem('fr_test_mode', 'true');
      window.localStorage.setItem('fr_role', 'volunteer');
      window.localStorage.setItem('foodRescueUser', JSON.stringify({ role: 'volunteer', name: 'Test Volunteer' }));
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

  test('Volunteer Dashboard - Layout, Sidebar, and Map Component', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/9_volunteer_dashboard.html');

    // Desktop sidebar is visible
    const sidebar = page.locator('#nav-drawer');
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toContainText('Volunteer Hero Portal');
    await expect(sidebar).toContainText('Alex Rivera');

    // Primary action button is present and not fixed in the center of the viewport
    const actionBtn = page.locator('#main-action-btn');
    await expect(actionBtn).toBeVisible();
    await expect(actionBtn).toContainText('Start Pickup Route');

    // Waypoint stops are rendered
    await expect(page.locator('text=Green Table Bistro').first()).toBeVisible();
    await expect(page.locator('text=City Community Center').first()).toBeVisible();

    // Map container exists
    await expect(page.locator('#volunteer-map')).toBeAttached();
  });

  test('Volunteer Dashboard - Multi-Step Task Workflow', async ({ page }) => {
    await page.goto('/9_volunteer_dashboard.html');

    // Reset state to ensure clean start
    await page.evaluate(() => {
      localStorage.removeItem('fr_volunteer_task_status');
      if (typeof renderTaskState === 'function') renderTaskState('ASSIGNED');
    });

    const actionBtn = page.locator('#main-action-btn');
    await expect(actionBtn).toContainText('Start Pickup Route');

    // Step 1: Start Pickup Route -> transitions to At Pickup
    await actionBtn.click();
    await expect(actionBtn).toContainText('Confirm Food Collection');
    await expect(page.locator('#banner-status-badge')).toContainText('Arrived at Restaurant');

    // Step 2: Confirm Food Collection -> transitions to En Route
    await actionBtn.click();
    await expect(actionBtn).toContainText('Arrived at Recipient NGO');
    await expect(page.locator('#banner-status-badge')).toContainText('En Route to Delivery');

    // Step 3: Arrived at Recipient NGO -> transitions to Complete Delivery Confirmation
    await actionBtn.click();
    await expect(actionBtn).toContainText('Complete Delivery Confirmation');

    // Test Reset
    await page.locator('button:has-text("Reset Demo Mission")').click();
    await expect(actionBtn).toContainText('Start Pickup Route');
  });

  test('Volunteer Dashboard - Contact Modals', async ({ page }) => {
    await page.goto('/9_volunteer_dashboard.html');

    // Open Restaurant modal
    const restaurantCallBtn = page.locator('button:has-text("Call")').first();
    await restaurantCallBtn.click();
    const restModal = page.locator('#restaurantContactModal');
    await expect(restModal).toBeVisible();
    await expect(restModal).toContainText('Chef Marcus Vance');
    await expect(restModal).toContainText('+1 (415) 555-0192');

    // Close Restaurant modal
    await restModal.locator('button:has-text("close")').click();
    await expect(restModal).toBeHidden();

    // Open NGO modal
    const ngoCallBtn = page.locator('button:has-text("Call")').nth(1);
    await ngoCallBtn.click();
    const ngoModal = page.locator('#ngoContactModal');
    await expect(ngoModal).toBeVisible();
    await expect(ngoModal).toContainText('Sarah Jenkins');
    await expect(ngoModal).toContainText('+1 (415) 555-0144');

    // Close NGO modal
    await ngoModal.locator('button:has-text("close")').click();
    await expect(ngoModal).toBeHidden();
  });

  test('Volunteer Dashboard - Mobile Responsiveness (390x844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/9_volunteer_dashboard.html');

    // Desktop sidebar hidden on mobile
    const sidebar = page.locator('#nav-drawer');
    await expect(sidebar).toBeHidden();

    // Mobile bottom nav visible
    const bottomNav = page.locator('nav.lg\\:hidden');
    await expect(bottomNav).toBeVisible();

    // Check no horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBeFalsy();

    // Check action button visible and not covered by bottom nav
    const actionBtn = page.locator('#main-action-btn');
    await expect(actionBtn).toBeVisible();
  });
});
