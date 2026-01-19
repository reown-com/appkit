import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConstantsUtil } from '@reown/appkit-common'

import { mockChainControllerState } from '../../exports/testing.js'
import { CUSTOM_DEEPLINK_WALLETS, MobileWalletUtil } from '../../src/utils/MobileWallet.js'

const ORIGINAL_HREF = 'https://example.com/path'
const mockWindow = {
  location: {
    href: ORIGINAL_HREF
  }
}

const actualWindow = window

describe('MobileWalletUtil', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.stubGlobal('window', {
      ...actualWindow,
      location: { href: ORIGINAL_HREF }
    })

    mockChainControllerState({ activeChain: ConstantsUtil.CHAIN.SOLANA })
  })

  it('should redirect to Phantom app when Phantom is not installed', () => {
    MobileWalletUtil.handleMobileDeeplinkRedirect(
      CUSTOM_DEEPLINK_WALLETS.PHANTOM.id,
      ConstantsUtil.CHAIN.SOLANA
    )

    const encodedHref = encodeURIComponent(ORIGINAL_HREF)
    const encodedRef = encodeURIComponent('https://example.com')
    const expectedUrl = `${CUSTOM_DEEPLINK_WALLETS.PHANTOM.url}/ul/browse/${encodedHref}?ref=${encodedRef}`

    expect(window.location.href).toBe(expectedUrl)
  })

  it('should redirect to Binance Web3 Wallet when Binance is not installed', () => {
    MobileWalletUtil.handleMobileDeeplinkRedirect(
      CUSTOM_DEEPLINK_WALLETS.BINANCE.id,
      ConstantsUtil.CHAIN.BITCOIN
    )

    const actualUrl = new URL(window.location.href)
    const actualDpEncoded = actualUrl.searchParams.get('_dp')!
    const actualDp = new URL(atob(actualDpEncoded))

    const encodedHref = encodeURIComponent(ORIGINAL_HREF)
    const expectedStartPagePath = window.btoa('/pages/browser/index')
    const expectedStartPageQuery = window.btoa(`url=${encodedHref}&defaultChainId=1`)

    expect(actualUrl.origin + actualUrl.pathname).toBe(CUSTOM_DEEPLINK_WALLETS.BINANCE.url)
    expect(actualDp.searchParams.get('appId')).toBe(CUSTOM_DEEPLINK_WALLETS.BINANCE.appId)
    expect(actualDp.searchParams.get('startPagePath')).toBe(expectedStartPagePath)
    expect(actualDp.searchParams.get('startPageQuery')).toBe(expectedStartPageQuery)
  })

  it('should not redirect when Phantom is installed', () => {
    vi.stubGlobal('window', {
      ...mockWindow,
      phantom: {}
    })

    const originalHref = window.location.href
    MobileWalletUtil.handleMobileDeeplinkRedirect(
      CUSTOM_DEEPLINK_WALLETS.PHANTOM.id,
      ConstantsUtil.CHAIN.SOLANA
    )

    expect(window.location.href).toBe(originalHref)
  })

  it('should not redirect when Binance Web3 Wallet is installed', () => {
    vi.stubGlobal('window', {
      ...mockWindow,
      binancew3w: {}
    })

    const originalHref = window.location.href
    MobileWalletUtil.handleMobileDeeplinkRedirect(
      CUSTOM_DEEPLINK_WALLETS.BINANCE.id,
      ConstantsUtil.CHAIN.BITCOIN
    )

    expect(window.location.href).toBe(originalHref)
  })

  it('should redirect to Coinbase Wallet when it is not installed', () => {
    MobileWalletUtil.handleMobileDeeplinkRedirect(
      CUSTOM_DEEPLINK_WALLETS.COINBASE.id,
      ConstantsUtil.CHAIN.SOLANA
    )

    const encodedHref = encodeURIComponent(ORIGINAL_HREF)
    const expectedUrl = `${CUSTOM_DEEPLINK_WALLETS.COINBASE.url}/dapp?cb_url=${encodedHref}`

    expect(window.location.href).toBe(expectedUrl)
  })

  it('should redirect to Coinbase Wallet if active namespace is Solana', () => {
    MobileWalletUtil.handleMobileDeeplinkRedirect(
      CUSTOM_DEEPLINK_WALLETS.COINBASE.id,
      ConstantsUtil.CHAIN.SOLANA
    )

    const encodedHref = encodeURIComponent(ORIGINAL_HREF)
    const expectedUrl = `${CUSTOM_DEEPLINK_WALLETS.COINBASE.url}/dapp?cb_url=${encodedHref}`

    expect(window.location.href).toBe(expectedUrl)
  })

  it('should not redirect when Coinbase Wallet is installed', () => {
    vi.stubGlobal('window', {
      ...mockWindow,
      coinbaseSolana: {}
    })

    const originalHref = window.location.href
    MobileWalletUtil.handleMobileDeeplinkRedirect(
      CUSTOM_DEEPLINK_WALLETS.COINBASE.id,
      ConstantsUtil.CHAIN.SOLANA
    )

    expect(window.location.href).toBe(originalHref)
  })

  it('should not redirect for unknown wallet names', () => {
    const originalHref = window.location.href
    MobileWalletUtil.handleMobileDeeplinkRedirect('other', ConstantsUtil.CHAIN.SOLANA)

    expect(window.location.href).toBe(originalHref)
  })

  it('should redirect to Coinbase Wallet with EVM deeplink when namespace is EVM', () => {
    MobileWalletUtil.handleMobileDeeplinkRedirect(
      CUSTOM_DEEPLINK_WALLETS.COINBASE.id,
      ConstantsUtil.CHAIN.EVM
    )

    const encodedHref = encodeURIComponent(ORIGINAL_HREF)
    const expectedUrl = `${CUSTOM_DEEPLINK_WALLETS.COINBASE.evmDeeplink}?url=${encodedHref}`

    expect(window.location.href).toBe(expectedUrl)
  })

  it('should not redirect for EVM Coinbase when coinbaseWalletExtension is installed', () => {
    vi.stubGlobal('window', {
      ...mockWindow,
      coinbaseWalletExtension: {}
    })

    const originalHref = window.location.href
    MobileWalletUtil.handleMobileDeeplinkRedirect(
      CUSTOM_DEEPLINK_WALLETS.COINBASE.id,
      ConstantsUtil.CHAIN.EVM
    )

    expect(window.location.href).toBe(originalHref)
  })

  it('should redirect to Solflare correctly', () => {
    MobileWalletUtil.handleMobileDeeplinkRedirect(
      CUSTOM_DEEPLINK_WALLETS.SOLFLARE.id,
      ConstantsUtil.CHAIN.SOLANA
    )

    const encodedHref = encodeURIComponent(ORIGINAL_HREF)
    const expectedUrl = `${CUSTOM_DEEPLINK_WALLETS.SOLFLARE.url}/ul/v1/browse/${encodedHref}?ref=${encodedHref}`

    //
    expect(window.location.href).toBe(expectedUrl)
  })

  describe('isCustomDeeplinkWallet', () => {
    it('should return true for Phantom wallet on Solana', () => {
      expect(
        MobileWalletUtil.isCustomDeeplinkWallet(CUSTOM_DEEPLINK_WALLETS.PHANTOM.id, 'solana')
      ).toBe(true)
    })

    it('should return false for Phantom wallet on EVM', () => {
      expect(
        MobileWalletUtil.isCustomDeeplinkWallet(CUSTOM_DEEPLINK_WALLETS.PHANTOM.id, 'eip155')
      ).toBe(false)
    })

    it('should return true for Coinbase wallet on Solana', () => {
      expect(
        MobileWalletUtil.isCustomDeeplinkWallet(CUSTOM_DEEPLINK_WALLETS.COINBASE.id, 'solana')
      ).toBe(true)
    })

    it('should return true for Coinbase wallet on EVM', () => {
      expect(
        MobileWalletUtil.isCustomDeeplinkWallet(CUSTOM_DEEPLINK_WALLETS.COINBASE.id, 'eip155')
      ).toBe(true)
    })

    it('should return false for Coinbase wallet on Bitcoin', () => {
      expect(
        MobileWalletUtil.isCustomDeeplinkWallet(CUSTOM_DEEPLINK_WALLETS.COINBASE.id, 'bip122')
      ).toBe(false)
    })

    it('should return true for Solflare wallet on Solana', () => {
      expect(
        MobileWalletUtil.isCustomDeeplinkWallet(CUSTOM_DEEPLINK_WALLETS.SOLFLARE.id, 'solana')
      ).toBe(true)
    })

    it('should return false for Solflare wallet on EVM', () => {
      expect(
        MobileWalletUtil.isCustomDeeplinkWallet(CUSTOM_DEEPLINK_WALLETS.SOLFLARE.id, 'eip155')
      ).toBe(false)
    })

    it('should return true for Binance wallet on Bitcoin', () => {
      expect(
        MobileWalletUtil.isCustomDeeplinkWallet(CUSTOM_DEEPLINK_WALLETS.BINANCE.id, 'bip122')
      ).toBe(true)
    })

    it('should return false for Binance wallet on Solana', () => {
      expect(
        MobileWalletUtil.isCustomDeeplinkWallet(CUSTOM_DEEPLINK_WALLETS.BINANCE.id, 'solana')
      ).toBe(false)
    })

    it('should return false for unknown wallet IDs', () => {
      expect(MobileWalletUtil.isCustomDeeplinkWallet('unknown-wallet-id', 'eip155')).toBe(false)
    })
  })
})
