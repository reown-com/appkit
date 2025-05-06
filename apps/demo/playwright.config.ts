import { defineConfig } from '@playwright/test'
import { config } from 'dotenv'

import { BASE_URL } from './tests/constants'

config({ path: './.env.local' })

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 1,
  reporter: [['list'], ['html']],
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: BASE_URL,

    /* Take a screenshot when the test fails */
    screenshot: 'only-on-failure',

    /* Collect trace regardless so we can debug latency regressions. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',

    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'Chromium',
      use: { browserName: 'chromium' }
    },
    {
      name: 'Firefox',
      use: { browserName: 'firefox' }
    }
  ],
  webServer: {
    command: 'pnpm playwright:start',
    url: BASE_URL,
    reuseExistingServer: !process.env['CI'] || Boolean(process.env['SKIP_PLAYWRIGHT_WEBSERVER'])
  }
})
