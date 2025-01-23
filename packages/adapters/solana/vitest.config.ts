// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Match test files and set environment
    environmentMatchGlobs: [['src/tests/client.test.ts', 'jsdom']]
  }
})
