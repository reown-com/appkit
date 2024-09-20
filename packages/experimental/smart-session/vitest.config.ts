import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true, // enables global test functions like 'describe', 'it', etc.
    environment: 'node' // use 'jsdom' if you need a browser-like environment
  }
})
