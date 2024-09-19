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
    const key = '@appkit/wallet_id'

    expect(SafeLocalStorage.setItem(key, '1')).toBe(undefined)
    expect(SafeLocalStorage.getItem(key)).toBe(undefined)
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

  afterAll(() => {
    getItem.mockClear()
    setItem.mockClear()
    removeItem.mockClear()
  })

  it('should setItem', () => {
    expect(SafeLocalStorage.setItem('@appkit/wallet_id', 'test')).toBe(undefined)
    expect(setItem).toHaveBeenCalledWith('@appkit/wallet_id', JSON.stringify('test'))
  })

  it('should getItem ', () => {
    expect(SafeLocalStorage.getItem('@appkit/wallet_id')).toEqual({ test: 'test' })
    expect(getItem).toHaveBeenCalledWith('@appkit/wallet_id')
  })

  it('should removeItem', () => {
    expect(SafeLocalStorage.removeItem('@appkit/wallet_id')).toBe(undefined)
    expect(removeItem).toHaveBeenCalledWith('@appkit/wallet_id')
  })

  it('getItem should return undefined when value is not valid JSON', () => {
    getItem.mockReturnValueOnce('test')

    expect(SafeLocalStorage.getItem('@appkit/wallet_id')).toBe(undefined)
    expect(getItem).toHaveBeenCalledWith('@appkit/wallet_id')
  })
})
