import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config — smoke tests against a locally booted dev server.
 *
 * Run locally:
 *   npm run e2e            # uses webServer (boots `next dev`)
 *   PLAYWRIGHT_BASE_URL=https://staging.example.com npm run e2e
 *
 * In CI the same command works — the webServer block boots the app on the
 * Actions runner, then tests run against http://localhost:3000.
 *
 * Adding browsers: each `projects` entry runs every test once. Start with
 * Chromium only — adding WebKit/Firefox doubles/triples CI time without
 * catching much in this app yet.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npm run dev',
        url: baseURL,
        timeout: 120_000,
        reuseExistingServer: !process.env.CI,
      },
});
