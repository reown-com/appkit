import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ConnectorController,
  CoreHelperUtil,
  OptionsController,
  StorageUtil
} from '@reown/appkit-controllers'
import type { WcWallet } from '@reown/appkit-controllers'

import { WalletUtil } from '../src/utils/WalletUtil'

// Connectors
const mockMetamaskConnector = {
  info: { rdns: 'io.metamask' },
  name: 'Metamask',
  id: '1',
  explorerId: '1',
  chain: 'eip155' as const,
  type: 'ANNOUNCED' as const
}

const mockRainbowConnector = {
  info: { rdns: 'io.rainbow' },
  name: 'Rainbow',
  id: '2',
  explorerId: '2',
  chain: 'eip155' as const,
  type: 'ANNOUNCED' as const
}
const mockMetamaskMobileConnector = {
  info: { rdns: 'io.metamask.mobile' },
  name: 'Metamask',
  id: '4',
  explorerId: '4',
  chain: 'eip155' as const,
  type: 'ANNOUNCED' as const
}
const mockCoinbaseconnector = {
  info: { rdns: 'io.coinbase' },
  name: 'Coinbase',
  id: '5',
  explorerId: '5',
  chain: 'eip155' as const,
  type: 'EXTERNAL' as const
}

// Wallets
const mockMetamaskWallet: WcWallet = { id: '1', name: 'Wallet 1', rdns: 'io.metamask' }
const mockRainbowWallet: WcWallet = { id: '2', name: 'Wallet 2', rdns: 'io.rainbow' }
const mockTrustWallet: WcWallet = { id: '3', name: 'Wallet 3', rdns: 'io.trustwallet' }
const mockCoinbaseWallet: WcWallet = { id: '5', name: 'Wallet 5', rdns: 'io.coinbase' }

describe('WalletUtil', () => {
  const mockWallets: WcWallet[] = [mockMetamaskWallet, mockRainbowWallet, mockTrustWallet]

  beforeEach(() => {
    // Reset all mocks before each test
    vi.restoreAllMocks()
    OptionsController.state.enableEIP6963 = true
  })

  describe('filterOutDuplicatesByRDNS', () => {
    it('should filter out wallets with RDNS from connectors and recent wallets', () => {
      const mockConnectors = [mockMetamaskConnector, mockRainbowConnector, mockCoinbaseconnector]
      const mockRecentWallets = [mockTrustWallet]

      vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue(mockConnectors)
      vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue(mockRecentWallets)
      vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)

      const filteredWallets = WalletUtil.filterOutDuplicatesByRDNS(mockWallets)

      expect(filteredWallets).toEqual([]) // All RDNS wallets should be filtered out
    })

    it('should replace "io.metamask.mobile" with "io.metamask" on mobile', () => {
      const mockConnectors = [mockMetamaskMobileConnector]
      const mockRecentWallets: WcWallet[] = []

      vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue(mockConnectors)
      vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue(mockRecentWallets)
      vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)

      const filteredWallets = WalletUtil.filterOutDuplicatesByRDNS(mockWallets)

      expect(filteredWallets).toEqual(mockWallets.filter(wallet => wallet.rdns !== 'io.metamask'))
    })

    it('should return all wallets if no connectors or recent wallets have RDNS', () => {
      vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue([])
      vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue([])

      const filteredWallets = WalletUtil.filterOutDuplicatesByRDNS(mockWallets)

      expect(filteredWallets).toEqual(mockWallets)
    })
  })

  describe('filterOutDuplicatesByIds', () => {
    it('should filter out wallets with IDs from connectors and recent wallets', () => {
      const mockConnectors = [mockMetamaskConnector, mockRainbowConnector]
      const mockRecentWallets = [mockTrustWallet]

      vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue(mockConnectors)
      vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue(mockRecentWallets)

      const filteredWallets = WalletUtil.filterOutDuplicatesByIds(mockWallets)

      expect(filteredWallets).toEqual([]) // All IDs are filtered out. MM and Rainbow from connectors, TW from recent
    })

    it('should not filter if connector is not Injected or Announced', () => {
      const mockConnectors = [mockMetamaskConnector, mockRainbowConnector]
      const mockRecentWallets = [mockTrustWallet]

      vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue(mockConnectors)
      vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue(mockRecentWallets)

      const filteredWallets = WalletUtil.filterOutDuplicatesByIds([
        ...mockWallets,
        mockCoinbaseWallet
      ])

      expect(filteredWallets).toEqual([mockCoinbaseWallet])
    })

    it('should return all wallets if no connectors or recent wallets have IDs', () => {
      vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue([])
      vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue([])

      const filteredWallets = WalletUtil.filterOutDuplicatesByIds(mockWallets)

      expect(filteredWallets).toEqual(mockWallets)
    })
  })

  describe('filterOutDuplicateWallets', () => {
    it('should filter out wallets with duplicate RDNS and IDs', () => {
      const mockConnectors = [mockMetamaskConnector]
      const mockRecentWallets = [mockTrustWallet]

      vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue(mockConnectors)
      vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue(mockRecentWallets)

      const filteredWallets = WalletUtil.filterOutDuplicateWallets(mockWallets)

      expect(filteredWallets).toEqual([mockRainbowWallet])
    })

    it('should return all wallets if no duplicates exist by RDNS or IDs', () => {
      const mockConnectors: WcWallet[] = []
      const mockRecentWallets: WcWallet[] = []

      vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue(
        mockConnectors as any
      )
      vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue(mockRecentWallets)

      const filteredWallets = WalletUtil.filterOutDuplicateWallets(mockWallets)

      expect(filteredWallets).toEqual(mockWallets)
    })
  })

  describe('markWalletsAsInstalled', () => {
    const mockWallets: WcWallet[] = [
      { id: '1', name: 'Wallet 1', rdns: 'io.metamask' },
      { id: '2', name: 'Wallet 2', rdns: 'io.rainbow' },
      { id: '3', name: 'Wallet 3', rdns: 'io.trustwallet' }
    ]

    beforeEach(() => {
      // Reset all mocks before each test
      vi.restoreAllMocks()
    })

    it('should mark wallets as installed based on connectors', () => {
      const mockConnectors = [mockMetamaskConnector, mockRainbowConnector]

      vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue(mockConnectors)

      const result = WalletUtil.markWalletsAsInstalled(mockWallets)

      expect(result).toEqual([
        { ...mockMetamaskWallet, installed: true },
        { ...mockRainbowWallet, installed: true },
        { ...mockTrustWallet, installed: false }
      ])
    })

    it('should return wallets sorted by installed status', () => {
      const mockConnectors = [mockRainbowConnector]

      vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue(mockConnectors)

      const result = WalletUtil.markWalletsAsInstalled(mockWallets)

      expect(result).toEqual([
        { ...mockRainbowWallet, installed: true },
        { ...mockMetamaskWallet, installed: false },
        { ...mockTrustWallet, installed: false }
      ])
    })

    it('should return wallets with installed false if no matching connectors are found', () => {
      const mockConnectors = [
        {
          type: 'ANNOUNCED' as const,
          info: { rdns: 'io.someotherwallet' },
          name: 'Test Wallet',
          id: '1233',
          chain: 'eip155' as const
        }
      ]

      vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue(mockConnectors)

      const result = WalletUtil.markWalletsAsInstalled(mockWallets)

      expect(result).toEqual([
        { ...mockMetamaskWallet, installed: false },
        { ...mockRainbowWallet, installed: false },
        { ...mockTrustWallet, installed: false }
      ])
    })

    it('should handle wallets without RDNS', () => {
      const walletsWithoutRDNS: WcWallet[] = [
        { id: '1', name: 'Wallet 1' },
        { id: '2', name: 'Wallet 2', rdns: 'io.rainbow' }
      ]

      const mockConnectors = [mockRainbowConnector]

      vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue(mockConnectors)

      const result = WalletUtil.markWalletsAsInstalled(walletsWithoutRDNS)

      expect(result).toEqual([
        { id: '2', name: 'Wallet 2', rdns: 'io.rainbow', installed: true },
        { id: '1', name: 'Wallet 1', installed: false }
      ])
    })
  })
})
