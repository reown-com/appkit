import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    environmentMatchGlobs: [['**/walletconnect.test.ts', 'jsdom']]
  }
})
