import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConstantsUtil } from '@reown/appkit-common'

import {
  ChainController,
  type ChainControllerState
} from '../../src/controllers/ChainController.js'
import { CUSTOM_DEEPLINK_WALLETS, MobileWalletUtil } from '../../src/utils/MobileWallet.js'

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

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: 'solana'
    } as unknown as ChainControllerState)
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

  it('should redirect to Coinbase Wallet when it is not installed', () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValueOnce({
      activeChain: ConstantsUtil.CHAIN.SOLANA
    } as unknown as ChainControllerState)
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
})
