import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { MobileWalletUtil } from '../src/MobileWallet'

const ORIGINAL_HREF = 'https://example.com/path'
const mockWindow = {
  location: {
    href: ORIGINAL_HREF
  }
}

describe('MobileWalletUtil', () => {
  beforeEach(() => {
    // Clean up window mock after each test
    vi.stubGlobal('window', {
      location: {
        href: ORIGINAL_HREF
      }
    })
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  describe('handleMobileWalletRedirection', () => {
    it('should redirect to Phantom app when Phantom is not installed', () => {
      MobileWalletUtil.handleMobileWalletRedirection({ name: 'Phantom' })

      const encodedHref = encodeURIComponent(ORIGINAL_HREF)
      const encodedRef = encodeURIComponent('https://example.com')
      const expectedUrl = `https://phantom.app/ul/browse/${encodedHref}?ref=${encodedRef}`

      expect(window.location.href).toBe(expectedUrl)
    })

    it('should not redirect when Phantom is installed', () => {
      vi.stubGlobal('window', {
        ...mockWindow,
        phantom: {}
      })

      const originalHref = window.location.href
      MobileWalletUtil.handleMobileWalletRedirection({ name: 'Phantom' })

      expect(window.location.href).toBe(originalHref)
    })

    it('should redirect to Coinbase Wallet when it is not installed', () => {
      MobileWalletUtil.handleMobileWalletRedirection({ name: 'Coinbase Wallet' })

      const encodedHref = encodeURIComponent(ORIGINAL_HREF)
      const expectedUrl = `https://go.cb-w.com/dapp?cb_url=${encodedHref}`

      expect(window.location.href).toBe(expectedUrl)
    })

    it('should not redirect when Coinbase Wallet is installed', () => {
      vi.stubGlobal('window', {
        ...mockWindow,
        coinbaseSolana: {}
      })

      const originalHref = window.location.href
      MobileWalletUtil.handleMobileWalletRedirection({ name: 'Coinbase Wallet' })

      expect(window.location.href).toBe(originalHref)
    })

    it('should not redirect for unknown wallet names', () => {
      const originalHref = window.location.href
      MobileWalletUtil.handleMobileWalletRedirection({ name: 'Unknown Wallet' })

      expect(window.location.href).toBe(originalHref)
    })
  })
})
