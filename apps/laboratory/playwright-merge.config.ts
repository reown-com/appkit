import { defineConfig } from '@playwright/test'

/**
 * Config file for playwright merge-reports command.
 * This helps reconcile different absolute testDir paths from sharded runs.
 */
export default defineConfig({
  // Reporters are specified on the CLI for the merge-reports command itself.
  // We can leave this empty or specify what the final merged report might look like,
  // but CLI options will typically override.
  reporter: [],

  // This is the crucial part. It tells merge-reports what the common
  // test directory should be considered for all incoming blob reports.
  // It should be relative to where merge-reports is run (apps/laboratory).
  testDir: './tests'
})
