// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CoreHelperUtil } from '../../src/utils/CoreHelperUtil.js'

// -- Tests --------------------------------------------------------------------
describe('CoreHelperUtil', () => {
  it('should return format balance as expected', () => {
    expect(CoreHelperUtil.parseBalance(undefined, undefined)).toEqual({
      value: '0',
      decimals: '000',
      symbol: undefined,
      formattedText: '0.000'
    })
    expect(CoreHelperUtil.parseBalance('3', undefined)).toEqual({
      value: '3',
      decimals: '000',
      symbol: undefined,
      formattedText: '3.000'
    })
    expect(CoreHelperUtil.parseBalance('0', undefined)).toEqual({
      value: '0',
      decimals: '000',
      symbol: undefined,
      formattedText: '0.000'
    })
    expect(CoreHelperUtil.parseBalance('123.456789', 'ETH')).toEqual({
      value: '123',
      decimals: '456',
      symbol: 'ETH',
      formattedText: '123.456 ETH'
    })
    expect(CoreHelperUtil.parseBalance('123.456789', undefined)).toEqual({
      value: '123',
      decimals: '456',
      symbol: undefined,
      formattedText: '123.456'
    })
    expect(CoreHelperUtil.parseBalance('0.000456789', 'BTC')).toEqual({
      value: '0',
      decimals: '000',
      symbol: 'BTC',
      formattedText: '0.000 BTC'
    })
    expect(CoreHelperUtil.parseBalance('123456789.123456789', 'USD')).toEqual({
      value: '123456789',
      decimals: '123',
      symbol: 'USD',
      formattedText: '123456789.123 USD'
    })
    expect(CoreHelperUtil.parseBalance('abc', 'USD')).toEqual({
      value: '0',
      decimals: '000',
      symbol: 'USD',
      formattedText: '0.000 USD'
    })
    expect(CoreHelperUtil.parseBalance('', 'USD')).toEqual({
      value: '0',
      decimals: '000',
      symbol: 'USD',
      formattedText: '0.000 USD'
    })
    expect(CoreHelperUtil.parseBalance('0', 'ETH')).toEqual({
      value: '0',
      decimals: '000',
      symbol: 'ETH',
      formattedText: '0.000 ETH'
    })
  })

  it.each([
    { address: '0x0', chain: undefined, expected: false },
    { address: '0x0', chain: 'eip155', expected: false },
    { address: '0xb3F068DCc2f92ED42E0417d4f2C2191f743fBfdA', chain: undefined, expected: true },
    { address: '0xb3F068DCc2f92ED42E0417d4f2C2191f743fBfdA', chain: 'eip155', expected: true },
    { address: '0xb3F068DCc2f92ED42E0417d4f2C2191f743fBfdA', chain: 'solana', expected: false },
    { address: '2VqKhjZ766ZN3uBtBpb7Ls3cN4HrocP1rzxzekhVEgpU', chain: 'solana', expected: true }
  ] as const)(
    'should return $expected validating $address when chain is $chain',
    ({ address, chain, expected }) => {
      expect(CoreHelperUtil.isAddress(address, chain)).toBe(expected)
    }
  )

  it('should return true when inside an iframe', () => {
    const originalTop = global.window.top
    const originalSelf = global.window.self
    try {
      ;(global.window as any).top = { name: 'top' }
      ;(global.window as any).self = { name: 'self' }

      expect(CoreHelperUtil.isIframe()).toBe(true)
    } finally {
      global.window.top = originalTop
      global.window.self = originalSelf
    }
  })

  it('should return false when not inside an iframe', () => {
    const originalTop = global.window.top
    const originalSelf = global.window.self

    try {
      global.window.top = global.window.self

      expect(CoreHelperUtil.isIframe()).toBe(false)
    } finally {
      global.window.top = originalTop
      global.window.self = originalSelf
    }
  })

  it.each([
    [undefined, false],
    [{}, false],
    ['0x0', false],
    ['eip155::mock_address', false],
    ['eip155:mock_chain_id:', false],
    ['invalid_namespace:mock_chain_id:address', false],
    ['eip155:mock_chain_id:mock_address', true],
    ['solana:mock_chain_id:mock_address', true],
    ['bip122:mock_chain_id:mock_address', true]
  ])('should validate the value $s is valid caip address $b', (caipAddress, expected) => {
    expect(CoreHelperUtil.isCaipAddress(caipAddress)).toEqual(expected)
  })

  describe('isMobile', () => {
    function mockMatchMedia(results: Record<string, boolean>) {
      vi.spyOn(window, 'matchMedia').mockImplementation(
        (query: string) =>
          ({
            matches: results[query] ?? false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn()
          }) as MediaQueryList
      )
    }

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should return true for iPhone user agent', () => {
      vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      )

      expect(CoreHelperUtil.isMobile()).toBe(true)
    })

    it('should return true for Android user agent', () => {
      vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
        'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
      )

      expect(CoreHelperUtil.isMobile()).toBe(true)
    })

    it('should return false for non-touch desktop', () => {
      vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      )
      mockMatchMedia({
        '(pointer:coarse)': false,
        '(any-pointer:fine)': true
      })

      expect(CoreHelperUtil.isMobile()).toBe(false)
    })

    it('should return false for touchscreen desktop/laptop', () => {
      vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      )
      mockMatchMedia({
        '(pointer:coarse)': true,
        '(any-pointer:fine)': true
      })

      expect(CoreHelperUtil.isMobile()).toBe(false)
    })

    it('should return true for coarse-only device without mobile UA', () => {
      vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
        'Mozilla/5.0 (X11; CrOS armv7l 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
      )
      mockMatchMedia({
        '(pointer:coarse)': true,
        '(any-pointer:fine)': false
      })

      expect(CoreHelperUtil.isMobile()).toBe(true)
    })
  })

  describe('formatNativeUrl', () => {
    const wcUri = 'wc:1234@1?bridge=https%3A%2F%2Fbridge.walletconnect.org&key=key'

    it('should format Binance Wallet URL with universal link', () => {
      const appUrl = 'bnc://app.binance.com/cedefi/'
      const universalLink = 'https://app.binance.com/cedefi/'

      const result = CoreHelperUtil.formatNativeUrl(appUrl, wcUri, universalLink)

      expect(result).toEqual({
        redirect: `${appUrl}wc?uri=${encodeURIComponent(wcUri)}`,
        redirectUniversalLink: `${universalLink}wc?uri=${encodeURIComponent(wcUri)}`,
        href: appUrl
      })
    })

    it('should format Rainbow URL with deeplink only', () => {
      const appUrl = 'rainbow://'

      const result = CoreHelperUtil.formatNativeUrl(appUrl, wcUri, null)

      expect(result).toEqual({
        redirect: `rainbow://wc?uri=${encodeURIComponent(wcUri)}`,
        href: 'rainbow://'
      })
    })

    it('should handle appUrl without trailing slash', () => {
      const appUrl = 'rainbow:'

      const result = CoreHelperUtil.formatNativeUrl(appUrl, wcUri, null)

      expect(result).toEqual({
        redirect: `rainbow://wc?uri=${encodeURIComponent(wcUri)}`,
        href: 'rainbow://'
      })
    })

    it('should double encode URI for Android Telegram', () => {
      const appUrl = 'rainbow://'

      // Mock Telegram and Android environment
      vi.spyOn(CoreHelperUtil, 'isTelegram').mockReturnValue(true)
      vi.spyOn(CoreHelperUtil, 'isAndroid').mockReturnValue(true)

      const result = CoreHelperUtil.formatNativeUrl(appUrl, wcUri, null)

      expect(result).toEqual({
        redirect: `rainbow://wc?uri=${encodeURIComponent(encodeURIComponent(wcUri))}`,
        href: 'rainbow://'
      })

      vi.restoreAllMocks()
    })

    it('should use formatUniversalUrl for http/https URLs', () => {
      const appUrl = 'https://app.binance.com/cedefi'

      const result = CoreHelperUtil.formatNativeUrl(appUrl, wcUri, null)

      expect(result).toEqual({
        redirect: `${appUrl}/wc?uri=${encodeURIComponent(wcUri)}`,
        href: `${appUrl}/`
      })
    })
  })

  describe('appendPayToUri', () => {
    const wcUri = 'wc:abc123@2?relay-protocol=irn&symKey=xyz'

    it('should return original URI when wcPayUrl is undefined', () => {
      expect(CoreHelperUtil.appendPayToUri(wcUri, undefined)).toBe(wcUri)
    })

    it('should return original URI when wcPayUrl is empty string', () => {
      expect(CoreHelperUtil.appendPayToUri(wcUri, '')).toBe(wcUri)
    })

    it('should append encoded pay param when wcPayUrl is provided', () => {
      const wcPayUrl = 'https://pay.walletconnect.com/?pid=pay_123'
      const result = CoreHelperUtil.appendPayToUri(wcUri, wcPayUrl)

      expect(result).toBe(`${wcUri}&pay=${encodeURIComponent(wcPayUrl)}`)
    })

    it('should properly encode special characters in wcPayUrl', () => {
      const wcPayUrl = 'https://pay.example.com/?id=123&amount=100&currency=USD'
      const result = CoreHelperUtil.appendPayToUri(wcUri, wcPayUrl)

      expect(result).toBe(`${wcUri}&pay=${encodeURIComponent(wcPayUrl)}`)
      expect(result).toContain('&pay=https%3A%2F%2Fpay.example.com')
    })
  })
})
