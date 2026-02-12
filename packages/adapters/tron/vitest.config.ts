// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environmentMatchGlobs: [['src/tests/client.test.ts', 'jsdom']]
  }
})
