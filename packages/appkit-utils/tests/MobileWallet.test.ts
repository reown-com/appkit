import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ChainController,
  type ChainControllerState,
  ConnectorController,
  RouterController
} from '@reown/appkit-core'

import { MobileWalletUtil } from '../src/MobileWallet'

const ORIGINAL_HREF = 'https://example.com/path'
const mockWindow = {
  location: {
    href: ORIGINAL_HREF
  }
}

const WALLETS = {
  phantom: {
    name: 'Phantom',
    id: 'phantom'
  },
  coinbase: {
    name: 'Coinbase Wallet',
    id: 'cbw'
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

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  describe('handleMobileWalletRedirection', () => {
    it('should redirect to Phantom app when Phantom is not installed', () => {
      MobileWalletUtil.handleMobileWalletRedirection(WALLETS.phantom)

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
      MobileWalletUtil.handleMobileWalletRedirection(WALLETS.phantom)

      expect(window.location.href).toBe(originalHref)
    })

    it('should redirect to Coinbase Wallet when it is not installed', () => {
      MobileWalletUtil.handleMobileWalletRedirection(WALLETS.coinbase)

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
      MobileWalletUtil.handleMobileWalletRedirection(WALLETS.coinbase)

      expect(window.location.href).toBe(originalHref)
    })

    it('should not redirect for unknown wallet names', () => {
      const originalHref = window.location.href
      MobileWalletUtil.handleMobileWalletRedirection({ name: 'Unknown', id: 'unknown' })

      expect(window.location.href).toBe(originalHref)
    })

    it('should route to ConnectingExternal if there is a connector', () => {
      const mockConnector = {
        id: 'connector',
        name: 'Connector',
        type: 'INJECTED' as const,
        chain: 'solana' as const
      }
      vi.spyOn(ConnectorController, 'getConnector').mockReturnValue(mockConnector)

      vi.spyOn(RouterController, 'push')

      MobileWalletUtil.handleMobileWalletRedirection({ name: 'Connector', id: 'connector' })

      expect(RouterController.push).toHaveBeenCalledWith('ConnectingExternal', {
        connector: mockConnector
      })
    })
    it('should route to ConnectingWalletConnect if there is not a connector', () => {
      vi.spyOn(ConnectorController, 'getConnector').mockReturnValue(undefined)
      vi.spyOn(RouterController, 'push')

      MobileWalletUtil.handleMobileWalletRedirection({ name: 'WalletConnect', id: 'wc' })

      expect(RouterController.push).toHaveBeenCalledWith('ConnectingWalletConnect', {
        wallet: { name: 'WalletConnect', id: 'wc' }
      })
    })
  })
})
