import { defineConfig, devices } from '@playwright/test'
import { LOCAL_LABS_URL } from './tests/shared/constants'

import { config } from 'dotenv'
config({ path: './.env.local' })

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html']],

  expect: {
    timeout: (process.env.CI ? 60 : 5) * 1000
  },
  timeout: 60 * 1000,

  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: LOCAL_LABS_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    video: process.env.CI ? 'off' : 'on-first-retry'
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    }

    /* Test against mobile viewports. */
    /*
     * {
     *   name: 'Mobile Chrome',
     *   use: { ...devices['Pixel 5'] },
     * },
     * {
     *   name: 'Mobile Safari',
     *   use: { ...devices['iPhone 12'] },
     * },
     */

    /* Test against branded browsers. */
    /*
     * {
     *   name: 'Microsoft Edge',
     *   use: { ...devices['Desktop Edge'], channel: 'msedge' },
     * },
     * {
     *   name: 'Google Chrome',
     *   use: { ..devices['Desktop Chrome'], channel: 'chrome' },
     * },
     */
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run playwright:start',
    url: LOCAL_LABS_URL,
    reuseExistingServer: !process.env.CI
  }
})
