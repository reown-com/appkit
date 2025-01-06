import { defineProject } from 'vitest/config'

// Exclude the exports directory from the test suite
export default defineProject({
  test: {
    // @ts-ignore
    coverage: {
      exclude: [
        'exports',
        'node_modules',
        'dist',
        'tests/**',
        './*.ts',
        './*.json',
        './*.ts',
        './*.md'
      ]
    }
  }
})
