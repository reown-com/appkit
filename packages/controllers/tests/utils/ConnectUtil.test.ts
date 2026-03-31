import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ConnectionController,
  ConnectorController,
  OptionsController
} from '../../exports/index.js'
import { AssetUtil } from '../../src/utils/AssetUtil.js'
import { ConnectUtil } from '../../src/utils/ConnectUtil.js'
import { CoreHelperUtil } from '../../src/utils/CoreHelperUtil.js'
import type { WcWallet } from '../../src/utils/TypeUtil.js'

// -- Helpers ------------------------------------------------------------------
function createMockWcWallet(overrides: Partial<WcWallet> = {}): WcWallet {
  return {
    id: 'wallet-id',
    name: 'Test Wallet',
    supports_wc: true,
    mobile_link: 'testwalletapp://',
    ...overrides
  }
}

// -- Tests --------------------------------------------------------------------
describe('ConnectUtil', () => {
  describe('getWalletConnectWallets', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
      ConnectorController.state.connectors = []
      OptionsController.state.featuredWalletIds = undefined
      ConnectionController.state.wcBasic = false
      vi.spyOn(AssetUtil, 'getWalletImageUrl').mockReturnValue('')
    })

    it('should filter out wallets without wc support from search results on mobile', () => {
      vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)

      const walletWithWc = createMockWcWallet({
        id: 'wc-wallet',
        name: 'WC Wallet',
        supports_wc: true
      })
      const walletWithoutWc = createMockWcWallet({
        id: 'no-wc-wallet',
        name: 'No WC Wallet',
        supports_wc: false,
        mobile_link: 'noWcWalletapp://'
      })

      const result = ConnectUtil.getWalletConnectWallets([], [walletWithWc, walletWithoutWc])

      expect(result.map(w => w.id)).toEqual(['wc-wallet'])
    })

    it('should include all search results on desktop regardless of wc support', () => {
      vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)

      const walletWithWc = createMockWcWallet({
        id: 'wc-wallet',
        name: 'WC Wallet',
        supports_wc: true
      })
      const walletWithoutWc = createMockWcWallet({
        id: 'no-wc-wallet',
        name: 'No WC Wallet',
        supports_wc: false
      })

      const result = ConnectUtil.getWalletConnectWallets([], [walletWithWc, walletWithoutWc])

      expect(result.map(w => w.id)).toEqual(['wc-wallet', 'no-wc-wallet'])
    })

    it('should preserve order of search results', () => {
      vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)

      const wallets = [
        createMockWcWallet({ id: 'wallet-0', name: 'Wallet 0' }),
        createMockWcWallet({ id: 'wallet-1', name: 'Wallet 1' }),
        createMockWcWallet({ id: 'wallet-2', name: 'Wallet 2' })
      ]

      const result = ConnectUtil.getWalletConnectWallets([], wallets)

      expect(result).toHaveLength(3)
      expect(result[0]?.id).toBe('wallet-0')
      expect(result[1]?.id).toBe('wallet-1')
      expect(result[2]?.id).toBe('wallet-2')
    })
  })
})
