import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ConnectionController,
  ConnectorController,
  OptionsController
} from '../../exports/index.js'
import { CoreHelperUtil } from '../../src/utils/CoreHelperUtil.js'
import type { WcWallet } from '../../src/utils/TypeUtil.js'
import { WalletUtil } from '../../src/utils/WalletUtil.js'

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
describe('WalletUtil', () => {
  describe('filterAndFlagWallets', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
      ConnectorController.state.connectors = []
      OptionsController.state.featuredWalletIds = undefined
      ConnectionController.state.wcBasic = false
    })

    it('should filter out wallets without wc support on mobile', () => {
      vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)

      const wallets = [
        createMockWcWallet({ id: 'wc-wallet', supports_wc: true }),
        createMockWcWallet({ id: 'no-wc-wallet', supports_wc: false })
      ]

      const result = WalletUtil.filterAndFlagWallets(wallets)

      expect(result.map(w => w.id)).toEqual(['wc-wallet'])
    })

    it('should pass through all wallets on desktop', () => {
      vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)

      const wallets = [
        createMockWcWallet({ id: 'wc-wallet', supports_wc: true }),
        createMockWcWallet({ id: 'no-wc-wallet', supports_wc: false })
      ]

      const result = WalletUtil.filterAndFlagWallets(wallets)

      expect(result.map(w => w.id)).toEqual(['wc-wallet', 'no-wc-wallet'])
    })

    it('should assign display_index to each wallet', () => {
      vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)

      const wallets = [
        createMockWcWallet({ id: 'wallet-0' }),
        createMockWcWallet({ id: 'wallet-1' }),
        createMockWcWallet({ id: 'wallet-2' })
      ]

      const result = WalletUtil.filterAndFlagWallets(wallets)

      expect(result[0]?.display_index).toBe(0)
      expect(result[1]?.display_index).toBe(1)
      expect(result[2]?.display_index).toBe(2)
    })
  })
})
