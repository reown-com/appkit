import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { SafeLocalStorage, type SafeLocalStorageItems } from '../src/utils/SafeLocalStorage'

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
    const key = '@w3m/wallet_id' as keyof SafeLocalStorageItems

    expect(SafeLocalStorage.setItem(key, '1')).toBe(undefined)
    expect(SafeLocalStorage.getItem(key)).toBe(null)
    expect(SafeLocalStorage.removeItem(key)).toBe(undefined)
  })
})

describe('SafeLocalStorage safe', () => {
  let getItem = vi.fn(value => {
    if (value === '@appkit/wallet_id') {
      return 'test'
    }

    return undefined
  })
  let setItem = vi.fn()
  let removeItem = vi.fn()

  beforeAll(() => {
    Object.assign(globalThis, { window: {}, localStorage: { getItem, setItem, removeItem } })
  })

  it('should setItem', () => {
    expect(SafeLocalStorage.setItem('@appkit/wallet_id', 'test')).toBe(undefined)
    expect(setItem).toHaveBeenCalledWith('@appkit/wallet_id', 'test')
  })

  it('should getItem ', () => {
    expect(SafeLocalStorage.getItem('@appkit/wallet_id')).toEqual('test')
    expect(getItem).toHaveBeenCalledWith('@appkit/wallet_id')
  })

  it('should removeItem', () => {
    expect(SafeLocalStorage.removeItem('@appkit/wallet_id')).toBe(undefined)
    expect(removeItem).toHaveBeenCalledWith('@appkit/wallet_id')
  })

  it('getItem should return undefined if the value not exist', () => {
    expect(SafeLocalStorage.getItem('@appkit/connected_connector')).toBe(undefined)
    expect(getItem).toHaveBeenCalledWith('@appkit/connected_connector')
  })
})
