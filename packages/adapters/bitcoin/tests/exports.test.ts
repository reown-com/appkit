import { beforeAll, describe, expect, it } from 'vitest'

describe('Bitcoin Adapter Exports', () => {
  beforeAll(async () => {
    // Import the exports to ensure polyfills are loaded
    await import('../exports/index')
  })

  it('should ensure polyfills are loaded when importing exports', () => {
    const polyfills = {
      Buffer: window.Buffer,
      global: window.global,
      process: window.process,
      'process.env': window.process.env
    }

    expect(window.Buffer).toBeDefined()
    expect(typeof window.Buffer).toBe('function')

    expect(window.global).toBeDefined()
    expect(window.global).toBe(window)

    expect(window.process).toBeDefined()
    expect(typeof window.process).toBe('object')

    expect(window.process.env).toBeDefined()
    expect(typeof window.process.env).toBe('object')

    const testBuffer = Buffer.from('test')
    expect(testBuffer).toBeInstanceOf(Buffer)

    Object.entries(polyfills).forEach(([, value]) => {
      expect(value).toBeDefined()
    })
  })
})
