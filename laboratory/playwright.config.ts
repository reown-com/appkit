import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// Require('dotenv').config();

const CI_SCHEDULE = process.env.CI_SCHEDULE
/*
 * CI_SCHEDULE == true
 * - https://lab.web3modal.com
 * - https://react-wallet.walletconnect.com
 *
 * CI_SCHEDULE == false
 * - http://127.0.0.1:3000
 * - https://react-wallet.walletconnect.com
 */

const LOCAL_SERVER = 'http://127.0.0.1:3000'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: Boolean(process.env.CI),
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  expect: {
    timeout: (process.env.CI ? 60 : 5) * 1000
  },
  timeout: 60 * 1000,
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: CI_SCHEDULE ? 'https://lab.web3modal.com' : LOCAL_SERVER,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry'
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
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
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
  webServer: CI_SCHEDULE
    ? undefined
    : {
        command: 'yarn dev',
        url: LOCAL_SERVER,
        reuseExistingServer: !process.env.CI
      }
})
