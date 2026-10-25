const { test, expect } = require('@playwright/test');

test.describe('Formal Terminology UI QA Suite', () => {

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('foodRescueToken', 'fake-token-123');
      window.localStorage.setItem('fr_test_mode', 'true');
      window.localStorage.setItem('foodRescueUser', JSON.stringify({ role: 'ngo', name: 'Test NGO' }));
    });
    await page.route('**/ngo/dashboard**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { totalClaimed: 12 } }) });
    });
  });

  test('1. NGO Dashboard Terminology and Navigation', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/10_ngo_dashboard.html');

    // Check donation card buttons have "Reserve Donation"
    const buttons = page.locator('button:has-text("Reserve Donation")');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(4);

    // Verify no "Claim Now" text exists on dashboard
    const oldButtons = page.locator('button:has-text("Claim Now")');
    expect(await oldButtons.count()).toBe(0);

    // Check Pending Collections section
    await expect(page.locator('text=Pending Collections')).toBeVisible();

    // Verify console errors (filter out expected CDN warnings)
    const fatalErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('cdn.tailwindcss.com') && !e.includes('Failed to load resource'));
    expect(fatalErrors.length).toBe(0);
  });

  test('2. Reservation Details Form & Terminology', async ({ page }) => {
    await page.goto('/ngo_claim_donation.html');

    // Header
    await expect(page.locator('h1')).toContainText('Reserve a Donation');

    // Form title
    await expect(page.locator('h3:has-text("Reservation Details")')).toBeVisible();

    // Preferred Pickup Time
    await expect(page.locator('label:has-text("Preferred Pickup Time")')).toBeVisible();
    await expect(page.locator('option:has-text("As Soon as Possible")')).toBeAttached();

    // Number of Intended Beneficiaries
    await expect(page.locator('label:has-text("Number of Intended Beneficiaries")')).toBeVisible();

    // Additional Requirements
    await expect(page.locator('label:has-text("Additional Requirements (Optional)")')).toBeVisible();

    // Collection Address
    await expect(page.locator('label:has-text("Collection Address")')).toBeVisible();

    // Arrange Volunteer Pickup
    await expect(page.locator('h3:has-text("Arrange Volunteer Pickup")')).toBeVisible();

    // Confirm Button
    const confirmBtn = page.locator('#confirmBtn');
    await expect(confirmBtn).toBeVisible();
    await expect(confirmBtn).toContainText('Confirm Reservation');

    // Verify old "Claim" terms do not appear in UI labels
    await expect(page.locator('text="Claim Now"')).toHaveCount(0);
    await expect(page.locator('text="Claim Details"')).toHaveCount(0);
    await expect(page.locator('text="Confirm Claim"')).toHaveCount(0);
    await expect(page.locator('text="Assign a Volunteer"')).toHaveCount(0);
  });

  test('3. Reservation Confirmation Flow', async ({ page }) => {
    // Intercept patch route
    await page.route('**/donations/**/claim', async route => {
      await route.fulfill({ status: 200, json: { status: 'success', message: 'Reserved' } });
    });

    await page.goto('/ngo_claim_donation.html?id=DON-TEST-123');
    await page.evaluate(() => localStorage.setItem('fr_test_mode', 'true'));

    await page.click('#confirmBtn');

    // Should redirect to success page (allowing for serve clean URL rewrites)
    await expect(page).toHaveURL(/.*ngo_claim_success(\.html)?/);

    // Verify success page text
    await expect(page.locator('h1')).toContainText('Reservation Confirmed!');
    await expect(page.locator('text=A volunteer will be assigned shortly to collect this donation')).toBeVisible();
  });

  test('4. Restaurant Donation History Terminology', async ({ page }) => {
    await page.goto('/restaurant_donation_history.html');

    // Check "Reserved by:"
    const reservedBy = page.locator('text=Reserved by:');
    expect(await reservedBy.count()).toBeGreaterThanOrEqual(4);

    // Check "Pending Reservation"
    const pendingRes = page.locator('text=Pending Reservation');
    expect(await pendingRes.count()).toBeGreaterThanOrEqual(1);

    // Verify old "Claimed by" does not appear
    expect(await page.locator('text=Claimed by:').count()).toBe(0);
    expect(await page.locator('text=Pending Claim').count()).toBe(0);
  });

  test('5. Mobile Responsiveness (390x844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/ngo_claim_donation.html');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#confirmBtn')).toBeVisible();

    // Verify no horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);

    await page.goto('/10_ngo_dashboard.html');
    const ngoScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const ngoClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(ngoScrollWidth).toBeLessThanOrEqual(ngoClientWidth + 5);
  });
});
