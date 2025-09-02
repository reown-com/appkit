import { vi } from 'vitest'

import '@reown/appkit-ui'

import '../exports/index.js'

// Ensure DOM globals are available
Object.defineProperty(window, 'global', {
  value: globalThis,
  writable: false
})

// Ensure HTMLElement is properly defined
if (!globalThis.HTMLElement) {
  globalThis.HTMLElement = class HTMLElement {}
}

// Mock customElements if not available
if (!globalThis.customElements) {
  globalThis.customElements = {
    define: vi.fn(),
    get: vi.fn(),
    whenDefined: vi.fn(() => Promise.resolve())
  }
}

// Mock document methods that might be used by web components
if (!globalThis.document.createElement) {
  Object.defineProperty(globalThis.document, 'createElement', {
    value: (tagName: string) => {
      const element = Object.create(HTMLElement.prototype)
      element.tagName = tagName.toUpperCase()
      element.nodeType = 1
      return element
    },
    writable: true
  })
}
