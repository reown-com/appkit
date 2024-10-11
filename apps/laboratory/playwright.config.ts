import { defineConfig } from '@playwright/test'
import { BASE_URL } from './tests/shared/constants'

import { config } from 'dotenv'
import type { ModalFixture } from './tests/shared/fixtures/w3m-fixture'
import { getProjects } from './tests/shared/utils/project'
import { getValue } from './tests/shared/utils/config'
config({ path: './.env.local' })

export default defineConfig<ModalFixture>({
  testDir: './tests',
  fullyParallel: true,
  retries: 1,
  workers: getValue(8, 4),
  reporter: getValue(
    [['list'], ['html', { host: '0.0.0.0' }]],
    [['list'], ['html', { host: '0.0.0.0' }]]
  ),
  // Limits the number of failed tests in the whole test suite. Playwright Test will stop after reaching this number of failed tests and skip any tests that were not executed yet
  maxFailures: getValue(10, undefined),
  expect: {
    timeout: getValue(60, 15) * 1000
  },
  timeout: 90 * 1000,

  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: BASE_URL,

    /* Take a screenshot when the test fails */
    screenshot: 'only-on-failure',

    /* Collect trace regardless so we can debug latency regressions. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',

    video: 'retain-on-failure'
  },

  /* Configure projects for major browsers */
  projects: getProjects(),

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm playwright:start',
    url: BASE_URL,
    reuseExistingServer: !process.env['CI'] || Boolean(process.env['SKIP_PLAYWRIGHT_WEBSERVER'])
  }
})
