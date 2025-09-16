import { vi } from 'vitest'

import '@reown/appkit-ui'

import '../exports/index.js'

// Mock ResizeObserver
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock window.open
global.open = vi.fn()

// Mock fetch for API calls
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ data: [] }),
    text: () => Promise.resolve('')
  } as Response)
)
