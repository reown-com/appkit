import { beforeAll, describe, expect, it, vi } from 'vitest'

import { SafeLocalStorage } from './SafeLocalStorage'

describe('SafeLocalStorage unsafe', () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, '_localStorage', {
      value: undefined,
      writable: true
    })
  })

  it('should not setItem', () => {
    const key = '@w3m/wallet_id'

    expect(SafeLocalStorage.setItem(key, '1')).toBe(undefined)
    expect(SafeLocalStorage.getItem(key)).toBe(null)
    expect(SafeLocalStorage.removeItem(key)).toBe(undefined)
  })
})

describe('SafeLocalStorage safe', () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, '_localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn()
      },
      writable: true
    })
  })

  it('should setItem', () => {
    const key = '@w3m/wallet_id'

    expect(SafeLocalStorage.setItem(key, 'test')).toBe(undefined)
    expect(SafeLocalStorage.getItem(key)).toBe(null)
    expect(SafeLocalStorage.removeItem(key)).toBe(undefined)
  })
})
