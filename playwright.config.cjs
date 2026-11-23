const { defineConfig, devices } = require('@playwright/test');

const ipadLandscape = devices['iPad Pro 11 landscape'];

module.exports = defineConfig({
  testDir: './tests/browser',
  forbidOnly: Boolean(process.env.CI),
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm start',
    url: 'http://127.0.0.1:4173',
  },
  projects: [
    { name: 'chromium', testIgnore: '**/*tactil.spec.cjs',
      use: { browserName: 'chromium' } },
    { name: 'firefox', testIgnore: '**/*tactil.spec.cjs',
      use: { browserName: 'firefox' } },
    { name: 'webkit', testIgnore: '**/*tactil.spec.cjs',
      use: { browserName: 'webkit' } },
    { name: 'webkit-ipad', testMatch: ['**/escenario.spec.cjs', '**/tactil.spec.cjs'],
      use: { ...ipadLandscape } },
    { name: 'chromium-tactil', testMatch: '**/*tactil.spec.cjs',
      use: { ...ipadLandscape, browserName: 'chromium' } },
  ],
});
