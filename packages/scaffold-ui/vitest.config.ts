import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    environmentOptions: {
      jsdom: {
        html: '<html><body></body></html>',
        userAgent: 'node.js',
        url: 'http://localhost'
      }
    }
  }
})
