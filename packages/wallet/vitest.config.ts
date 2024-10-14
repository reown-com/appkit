import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    ...configDefaults,
    globals: true,
    environment: 'jsdom',
    testTimeout: 60_000
  }
})
