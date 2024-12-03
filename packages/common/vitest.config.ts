import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    ...configDefaults,
    globals: true
  }
})
