import { defineConfig } from '@playwright/test'
import { config } from 'dotenv'

import { BASE_URL } from '@reown/appkit-testing'

import type { ModalFixture } from './tests/shared/fixtures/w3m-fixture'
import { getValue } from './tests/shared/utils/config'
import { getProjects } from './tests/shared/utils/project'

config({ path: './.env.local' })

// Read environment variable for shard suffix, to make blob report filenames unique
const shardSuffix = process.env['PLAYWRIGHT_SHARD_SUFFIX']
const blobOutputDir = 'playwright-blob-reports'
const blobFileName = shardSuffix ? `report-${shardSuffix}.zip` : 'report.zip'

export default defineConfig<ModalFixture>({
  testDir: './tests',
  fullyParallel: true,
  workers: getValue(8, 4),
  reporter: process.env['CI']
    ? [['blob', { outputDir: blobOutputDir, fileName: blobFileName }]]
    : [['list'], ['html', { host: '0.0.0.0' }], ['json', { outputFile: 'test-results.json' }]],
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
    trace: 'retain-on-failure',
    video: {
      mode: 'retain-on-failure',
      size: {
        width: 640,
        height: 480
      }
    }
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
