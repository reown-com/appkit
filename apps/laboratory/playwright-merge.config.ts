import { defineConfig } from '@playwright/test'

/**
 * Config file for playwright merge-reports command.
 * This helps reconcile different absolute testDir paths from sharded runs.
 */
export default defineConfig({
  // Reporters are defined here. `merge-reports` should create a `playwright-report` directory
  // in its CWD (apps/laboratory) by default, and `outputFile` for json reporter
  // should be relative to that.
  reporter: [['json', { outputFile: 'report.json' }], ['html']],

  // This is the crucial part. It tells merge-reports what the common
  // test directory should be considered for all incoming blob reports.
  // It should be relative to where merge-reports is run (apps/laboratory).
  testDir: './tests'
})
