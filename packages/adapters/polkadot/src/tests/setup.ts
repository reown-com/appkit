import { beforeEach, vi } from 'vitest'

declare global {
  interface Window {
    injectedWeb3?: Record<string, { name: string; version: string; enable?: any }>
  }
}

beforeEach(() => {
  // Reset injectedWeb3 before each test
  ;(window as any).injectedWeb3 = undefined

  // Clear mocks
  vi.clearAllMocks()
})
