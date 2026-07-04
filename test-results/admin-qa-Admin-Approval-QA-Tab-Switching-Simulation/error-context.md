# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-qa.spec.js >> Admin Approval QA >> Tab Switching Simulation
- Location: tests\admin-qa.spec.js:31:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("NGOs")').first()

```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic [ref=e3]:
    - generic [ref=e6]: restaurant
    - generic [ref=e7]:
      - heading "Welcome Back" [level=1] [ref=e8]
      - paragraph [ref=e9]: Login to your account
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]: Email Address
        - generic [ref=e13]:
          - generic: mail
          - textbox "name@example.com" [ref=e14]
      - generic [ref=e15]:
        - generic [ref=e16]: Password
        - generic [ref=e17]:
          - generic: lock
          - textbox "••••••••" [ref=e18]
          - button "visibility" [ref=e19] [cursor=pointer]:
            - generic [ref=e20]: visibility
        - button "Forgot Password?" [ref=e22] [cursor=pointer]
      - button "Continue arrow_forward" [ref=e23] [cursor=pointer]:
        - text: Continue
        - generic [ref=e24]: arrow_forward
    - paragraph [ref=e25]:
      - text: Don't have an account?
      - link "Join free" [ref=e26] [cursor=pointer]:
        - /url: 2_role_selection.html
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test.describe('Admin Approval QA', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Add fake token to prevent redirect
  6  |     await page.goto('/');
  7  |     await page.evaluate(() => {
  8  |       window.localStorage.setItem('foodRescueToken', 'fake-token-123');
  9  |     });
  10 |   });
  11 | 
  12 |   test('Approve Verification Request', async ({ page }) => {
  13 |     await page.goto('/15_verification_management.html');
  14 | 
  15 |     // Wait for cards to load
  16 |     const approveBtns = page.locator('button:has-text("Approve")');
  17 |     const initialCount = await approveBtns.count();
  18 |     
  19 |     if (initialCount > 0) {
  20 |       // Click first approve
  21 |       await approveBtns.first().click();
  22 |       
  23 |       // Wait for card to animate out
  24 |       await page.waitForTimeout(500);
  25 |       
  26 |       const newCount = await approveBtns.count();
  27 |       expect(newCount).toBeLessThan(initialCount);
  28 |     }
  29 |   });
  30 | 
  31 |   test('Tab Switching Simulation', async ({ page }) => {
  32 |     await page.goto('/15_verification_management.html');
  33 | 
  34 |     const ngoTab = page.locator('button:has-text("NGOs")').first();
> 35 |     await ngoTab.click();
     |                  ^ Error: locator.click: Test timeout of 30000ms exceeded.
  36 |     await expect(ngoTab).toHaveClass(/active-tab/);
  37 |   });
  38 | });
  39 | 
```