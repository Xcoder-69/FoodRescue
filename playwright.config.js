const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3005',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'npm start',
      port: 3009,
      env: {
        PORT: '3009'
      },
      reuseExistingServer: false,
      timeout: 120000,
    },
    {
      command: 'npx -y serve -p 3005',
      port: 3005,
      reuseExistingServer: true,
      timeout: 120000,
    }
  ],
});
