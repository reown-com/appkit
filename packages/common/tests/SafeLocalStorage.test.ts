import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { SafeLocalStorage } from '../src/utils/SafeLocalStorage'

const previousLocalStorage = globalThis.localStorage
const previousWindow = globalThis.window

afterAll(() => {
  Object.assign(globalThis, { localStorage: previousLocalStorage, window: previousWindow })
})

describe('SafeLocalStorage unsafe', () => {
  beforeAll(() => {
    Object.assign(globalThis, { window: {}, localStorage: undefined })
  })

  it('should not setItem', () => {
    const key = '@w3m/wallet_id'

    expect(SafeLocalStorage.setItem(key, '1')).toBe(undefined)
    expect(SafeLocalStorage.getItem(key)).toBe(null)
    expect(SafeLocalStorage.removeItem(key)).toBe(undefined)
  })
})

describe('SafeLocalStorage safe', () => {
  let getItem = vi.fn(() => '{"test":"test"}')
  let setItem = vi.fn()
  let removeItem = vi.fn()

  beforeAll(() => {
    Object.assign(globalThis, { window: {}, localStorage: { getItem, setItem, removeItem } })
  })

  it('should setItem', () => {
    expect(SafeLocalStorage.setItem('@w3m/wallet_id', 'test')).toBe(undefined)
    expect(setItem).toHaveBeenCalledWith('@w3m/wallet_id', '"test"')
  })

  it('should getItem', () => {
    expect(SafeLocalStorage.getItem('@w3m/wallet_id')).toEqual({ test: 'test' })
    expect(getItem).toHaveBeenCalledWith('@w3m/wallet_id')
  })

  it('should removeItem', () => {
    expect(SafeLocalStorage.removeItem('@w3m/wallet_id')).toBe(undefined)
    expect(removeItem).toHaveBeenCalledWith('@w3m/wallet_id')
  })
})
