import { defineConfig } from '@playwright/test'

/**
 * Config file for playwright merge-reports command.
 * This helps reconcile different absolute testDir paths from sharded runs.
 */
export default defineConfig({
  // Define the reporters for the merge operation directly here.
  // The merge-reports command will create these in its output directory (playwright-report).
  reporter: [
    ['json', { outputFile: 'report.json' }] // Isolate to only the JSON reporter for now
  ],

  // This is the crucial part. It tells merge-reports what the common
  // test directory should be considered for all incoming blob reports.
  // It should be relative to where merge-reports is run (apps/laboratory).
  testDir: './tests'
})
