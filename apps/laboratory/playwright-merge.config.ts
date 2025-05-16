import { defineConfig } from '@playwright/test'

/**
 * Config file for playwright merge-reports command.
 * This helps reconcile different absolute testDir paths from sharded runs.
 */
export default defineConfig({
  // Specify the output directory for the merged report structure.
  // This should make playwright merge-reports create this directory (relative to CWD of the command)
  // and place reporter outputs within it.
  outputDir: './playwright-report',

  // Define the reporters for the merge operation directly here.
  // The merge-reports command will create these in its output directory (playwright-report).
  reporter: [
    ['json', { outputFile: 'report.json' }] // JSON report should go into outputDir
  ],

  // This is the crucial part. It tells merge-reports what the common
  // test directory should be considered for all incoming blob reports.
  // It should be relative to where merge-reports is run (apps/laboratory).
  testDir: './tests'
})
