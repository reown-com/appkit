import { describe, expect, it, vi, beforeEach } from 'vitest'
import Cookies from 'js-cookie'
import { CookiesStorage } from '../src/utils/CookiesStorage'
import { SafeLocalStorageKeys } from '../src/utils/SafeLocalStorage'

vi.mock('js-cookie')

describe('CookiesStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should set cookie with transformed key', () => {
    const key = '@appkit/wallet_id'
    const value = 'test-value'

    CookiesStorage.setItem(key, value)

    expect(Cookies.set).toHaveBeenCalledWith('appkit.wallet_id', value)
  })

  it('should get cookie with transformed key', () => {
    const key = '@appkit/wallet_id'
    const value = 'test-value'

    vi.mocked(Cookies.get).mockReturnValue(value)

    const result = CookiesStorage.getItem(key)

    expect(Cookies.get).toHaveBeenCalledWith('appkit.wallet_id')
    expect(result).toBe(value)
  })

  it('should remove cookie with transformed key', () => {
    const key = '@appkit/wallet_id'

    CookiesStorage.removeItem(key)

    expect(Cookies.remove).toHaveBeenCalledWith('appkit.wallet_id')
  })

  it('should clear all cookies', () => {
    CookiesStorage.clear()

    Object.values(SafeLocalStorageKeys).forEach(key => {
      const cookieKey = key.replace('@', '').replace('/', '.')
      expect(Cookies.remove).toHaveBeenCalledWith(cookieKey)
    })
  })
})
