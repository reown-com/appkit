/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reportOnFailure: true,
      all: true,
      reporter: ['text', 'json', 'json-summary']
    }
  }
})
