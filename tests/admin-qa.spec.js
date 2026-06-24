const { test, expect } = require('@playwright/test');

test.describe('Admin Approval QA', () => {
  test.beforeEach(async ({ page }) => {
    // Add fake token to prevent redirect
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.setItem('foodRescueToken', 'fake-token-123');
    });
  });

  test('Approve Verification Request', async ({ page }) => {
    await page.goto('/15_verification_management.html');

    // Wait for cards to load
    const approveBtns = page.locator('button:has-text("Approve")');
    const initialCount = await approveBtns.count();
    
    if (initialCount > 0) {
      // Click first approve
      await approveBtns.first().click();
      
      // Wait for card to animate out
      await page.waitForTimeout(500);
      
      const newCount = await approveBtns.count();
      expect(newCount).toBeLessThan(initialCount);
    }
  });

  test('Tab Switching Simulation', async ({ page }) => {
    await page.goto('/15_verification_management.html');

    const ngoTab = page.locator('button:has-text("NGOs")').first();
    await ngoTab.click();
    await expect(ngoTab).toHaveClass(/active-tab/);
  });
});
