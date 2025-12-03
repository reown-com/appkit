import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConstantsUtil } from '@reown/appkit-common'
import {
  type Connector,
  type ConnectorWithProviders,
  type WcWallet
} from '@reown/appkit-controllers'

import { ApiController as ApiControllerRelative } from '../../src/controllers/ApiController.js'
import { ConnectionController as ConnectionControllerRelative } from '../../src/controllers/ConnectionController.js'
import { ConnectorController as ConnectorControllerRelative } from '../../src/controllers/ConnectorController.js'
import { OptionsController as OptionsControllerRelative } from '../../src/controllers/OptionsController.js'
import { ConnectorUtil } from '../../src/utils/ConnectorUtil'
import { CoreHelperUtil } from '../../src/utils/CoreHelperUtil.js'
import { OptionsUtil } from '../../src/utils/OptionsUtil.js'
import { WalletUtil } from '../../src/utils/WalletUtil'

const INJECTED = { id: 'injected' } as WcWallet
const RECENT = { id: 'recent' } as WcWallet
const FEATURED = { id: 'featured' } as WcWallet
const CUSTOM = { id: 'custom' } as WcWallet
const EXTERNAL = { id: 'external' } as WcWallet
const MULTI_CHAIN = { id: 'multiChain' } as WcWallet

const INJECTED_CONNECTOR = {
  id: 'injected',
  type: 'INJECTED',
  info: { rdns: 'browser.wallet' },
  name: 'Browser Wallet',
  chain: { id: 'eip155:1' }
} as unknown as ConnectorWithProviders
const ANNOUNCED_CONNECTOR = {
  id: 'announced',
  type: 'ANNOUNCED',
  info: { rdns: 'announced.wallet' },
  name: 'Announced Wallet',
  chain: { id: 'eip155:1' }
} as unknown as ConnectorWithProviders

describe('ConnectorUtil', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getConnectorTypeOrder', () => {
    it('should return connector positions in order of overriddenConnectors first then enabled connectors', () => {
      vi.spyOn(ConnectorUtil, 'getIsConnectedWithWC').mockReturnValue(false)

      const result = ConnectorUtil.getConnectorTypeOrder({
        recommended: [],
        featured: [FEATURED],
        custom: [CUSTOM],
        recent: [RECENT],
        announced: [INJECTED],
        injected: [INJECTED],
        multiChain: [MULTI_CHAIN],
        external: [EXTERNAL],
        overriddenConnectors: ['featured', 'walletConnect', 'injected']
      })

      expect(result).toEqual([
        'featured',
        'walletConnect',
        'injected',
        'recent',
        'custom',
        'external'
      ])
    })

    it('should use default connectorPosition from OptionsController when overriddenConnectors not provided', () => {
      vi.spyOn(ConnectorUtil, 'getIsConnectedWithWC').mockReturnValue(false)
      const originalFeatures = OptionsControllerRelative.state.features
      OptionsControllerRelative.state.features = {
        ...originalFeatures,
        connectorTypeOrder: ['injected', 'walletConnect']
      }

      const result = ConnectorUtil.getConnectorTypeOrder({
        recommended: [],
        featured: [FEATURED],
        custom: [CUSTOM],
        recent: [RECENT],
        announced: [INJECTED],
        injected: [INJECTED],
        multiChain: [MULTI_CHAIN],
        external: [EXTERNAL]
      })

      OptionsControllerRelative.state.features = originalFeatures

      expect(result).toEqual([
        'injected',
        'walletConnect',
        'recent',
        'featured',
        'custom',
        'external'
      ])
    })

    it('should only include enabled connectors', () => {
      vi.spyOn(ConnectorUtil, 'getIsConnectedWithWC').mockReturnValue(false)
      const originalFeatures = OptionsControllerRelative.state.features
      OptionsControllerRelative.state.features = {
        ...originalFeatures,
        connectorTypeOrder: ['injected', 'recommended']
      }

      const result = ConnectorUtil.getConnectorTypeOrder({
        recommended: [],
        featured: [FEATURED],
        custom: [CUSTOM],
        recent: [RECENT],
        announced: [],
        injected: [],
        multiChain: [],
        external: [EXTERNAL]
      })

      OptionsControllerRelative.state.features = originalFeatures

      expect(result).toEqual(['walletConnect', 'recent', 'featured', 'custom', 'external'])

      expect(result).not.toContain('injected')
    })
  })

  describe('showConnector', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should hide browser wallet on desktop', () => {
      vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)

      expect(ConnectorUtil.showConnector(INJECTED_CONNECTOR)).toBe(false)
    })

    it('should show browser wallet on mobile', () => {
      vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)
      vi.spyOn(ConnectionControllerRelative, 'checkInstalled').mockReturnValue(true)
      ApiControllerRelative.state.excludedWallets = []

      expect(ConnectorUtil.showConnector(INJECTED_CONNECTOR)).toBe(true)
    })

    it('should hide injected connector when not installed and no rdns', () => {
      vi.spyOn(ConnectionControllerRelative, 'checkInstalled').mockReturnValue(false)

      expect(ConnectorUtil.showConnector({ ...INJECTED_CONNECTOR, info: undefined })).toBe(false)
    })

    it('should hide connector when rdns is excluded', () => {
      ApiControllerRelative.state.excludedWallets = [
        { rdns: 'browser.wallet', name: 'Test Wallet' }
      ]

      expect(ConnectorUtil.showConnector(INJECTED_CONNECTOR)).toBe(false)
    })

    it('should hide connector when name is excluded', () => {
      ApiControllerRelative.state.excludedWallets = [
        { name: 'Browser Wallet', rdns: 'test.wallet' }
      ]

      expect(ConnectorUtil.showConnector(INJECTED_CONNECTOR)).toBe(false)
    })

    it('should hide announced connector when excluded with rdns', () => {
      ApiControllerRelative.state.excludedWallets = [
        { rdns: 'announced.wallet', name: 'Announced Wallet' }
      ]

      expect(ConnectorUtil.showConnector(ANNOUNCED_CONNECTOR)).toBe(false)
    })

    it('should hide announced connector when excluded with name', () => {
      ApiControllerRelative.state.excludedWallets = [
        { name: 'Announced Wallet', rdns: 'announced' }
      ]

      expect(ConnectorUtil.showConnector(ANNOUNCED_CONNECTOR)).toBe(false)
    })

    it('should show injected connector when not excluded', () => {
      ApiControllerRelative.state.excludedWallets = []
      vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)
      vi.spyOn(ConnectionControllerRelative, 'checkInstalled').mockReturnValue(true)

      expect(ConnectorUtil.showConnector(INJECTED_CONNECTOR)).toBe(true)
    })

    it('should show announced connector when not excluded', () => {
      ApiControllerRelative.state.excludedWallets = []

      expect(ConnectorUtil.showConnector(ANNOUNCED_CONNECTOR)).toBe(true)
    })
  })

  describe('getAuthName', () => {
    it('should return socialUsername when provided and not discord ending with 0', () => {
      const result = ConnectorUtil.getAuthName({
        email: 'test@example.com',
        socialUsername: 'john_doe',
        socialProvider: 'github'
      })

      expect(result).toBe('john_doe')
    })

    it('should return socialUsername without last character when discord provider and ends with 0', () => {
      const result = ConnectorUtil.getAuthName({
        email: 'test@example.com',
        socialUsername: 'john_doe0',
        socialProvider: 'discord'
      })

      expect(result).toBe('john_doe')
    })

    it('should return socialUsername as-is when discord provider but does not end with 0', () => {
      const result = ConnectorUtil.getAuthName({
        email: 'test@example.com',
        socialUsername: 'john_doe1',
        socialProvider: 'discord'
      })

      expect(result).toBe('john_doe1')
    })

    it('should return socialUsername when provided and socialProvider is null', () => {
      const result = ConnectorUtil.getAuthName({
        email: 'test@example.com',
        socialUsername: 'john_doe',
        socialProvider: null
      })

      expect(result).toBe('john_doe')
    })

    it('should return email when socialUsername is not provided', () => {
      const result = ConnectorUtil.getAuthName({
        email: 'test@example.com'
      })

      expect(result).toBe('test@example.com')
    })

    it('should return email when socialUsername is null', () => {
      const result = ConnectorUtil.getAuthName({
        email: 'test@example.com',
        socialUsername: null
      })

      expect(result).toBe('test@example.com')
    })

    it('should return email when socialUsername is empty string', () => {
      const result = ConnectorUtil.getAuthName({
        email: 'test@example.com',
        socialUsername: ''
      })

      expect(result).toBe('test@example.com')
    })

    it('should truncate email when longer than 30 characters', () => {
      const longEmail = 'verylongemailaddress@verylongdomain.com'
      const result = ConnectorUtil.getAuthName({
        email: longEmail
      })

      expect(result).toBe(`${longEmail.slice(0, -3)}...`)
      expect(result).toBe('verylongemailaddress@verylongdomain....')
    })

    it('should return full email when exactly 30 characters', () => {
      const email = 'test12345@example12345678.com'
      const result = ConnectorUtil.getAuthName({
        email
      })

      expect(result).toBe(email)
    })

    it('should return full email when less than 30 characters', () => {
      const shortEmail = 'short@test.com'
      const result = ConnectorUtil.getAuthName({
        email: shortEmail
      })

      expect(result).toBe(shortEmail)
    })
  })

  describe('fetchProviderData', () => {
    const mockProvider = {
      request: vi.fn()
    }

    const mockConnector = {
      name: 'Test Wallet',
      id: 'test-connector',
      provider: mockProvider
    } as unknown as Connector

    beforeEach(() => {
      vi.clearAllMocks()
      mockProvider.request.mockClear()
    })

    it('should return empty data for Browser Wallet on desktop', async () => {
      vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)

      const browserWalletConnector = {
        ...mockConnector,
        name: 'Browser Wallet'
      } as Connector

      const result = await ConnectorUtil.fetchProviderData(browserWalletConnector)

      expect(result).toEqual({ accounts: [], chainId: undefined })
      expect(mockProvider.request).not.toHaveBeenCalled()
    })

    it('should return empty data for AUTH connector', async () => {
      const authConnector = {
        ...mockConnector,
        id: ConstantsUtil.CONNECTOR_ID.AUTH
      } as Connector

      const result = await ConnectorUtil.fetchProviderData(authConnector)

      expect(result).toEqual({ accounts: [], chainId: undefined })
      expect(mockProvider.request).not.toHaveBeenCalled()
    })

    it('should fetch accounts and chainId successfully', async () => {
      const mockAccounts = ['0x123', '0x456']
      const mockChainId = '0x1'

      mockProvider.request.mockResolvedValueOnce(mockAccounts).mockResolvedValueOnce(mockChainId)

      const result = await ConnectorUtil.fetchProviderData(mockConnector)

      expect(result).toEqual({
        accounts: mockAccounts,
        chainId: 1
      })

      expect(mockProvider.request).toHaveBeenCalledTimes(2)
      expect(mockProvider.request).toHaveBeenNthCalledWith(1, { method: 'eth_accounts' })
      expect(mockProvider.request).toHaveBeenNthCalledWith(2, { method: 'eth_chainId' })
    })

    it('should return empty data when provider is undefined', async () => {
      const connectorWithoutProvider = {
        ...mockConnector,
        provider: undefined
      } as Connector

      const result = await ConnectorUtil.fetchProviderData(connectorWithoutProvider)

      expect(result).toEqual({ accounts: undefined, chainId: undefined })
    })

    it('should handle eth_accounts request failure gracefully', async () => {
      mockProvider.request
        .mockRejectedValueOnce(new Error('eth_accounts failed'))
        .mockResolvedValueOnce('0x1')

      const result = await ConnectorUtil.fetchProviderData(mockConnector)

      expect(result).toEqual({ accounts: [], chainId: undefined })
    })

    it('should handle eth_chainId request failure gracefully', async () => {
      mockProvider.request
        .mockResolvedValueOnce(['0x123'])
        .mockRejectedValueOnce(new Error('eth_chainId failed'))

      const result = await ConnectorUtil.fetchProviderData(mockConnector)

      expect(result).toEqual({ accounts: [], chainId: undefined })
    })

    it('should handle both requests failing gracefully', async () => {
      mockProvider.request
        .mockRejectedValueOnce(new Error('eth_accounts failed'))
        .mockRejectedValueOnce(new Error('eth_chainId failed'))

      const result = await ConnectorUtil.fetchProviderData(mockConnector)

      expect(result).toEqual({ accounts: [], chainId: undefined })
    })

    it('should convert various hex chainId formats correctly', async () => {
      const testCases = [
        { hex: '0x1', expected: 1 },
        { hex: '0xa', expected: 10 },
        { hex: '0x38', expected: 56 },
        { hex: '0x89', expected: 137 },
        { hex: '0xa4b1', expected: 42161 }
      ]

      for (const { hex, expected } of testCases) {
        mockProvider.request.mockClear()
        mockProvider.request.mockResolvedValueOnce(['0x123']).mockResolvedValueOnce(hex)

        const result = await ConnectorUtil.fetchProviderData(mockConnector)

        expect(result.chainId).toBe(expected)
      }
    })

    it('should handle Browser Wallet on mobile correctly', async () => {
      vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)

      const browserWalletConnector = {
        ...mockConnector,
        name: 'Browser Wallet'
      } as Connector

      const mockAccounts = ['0x789']
      const mockChainId = '0x1'

      mockProvider.request.mockResolvedValueOnce(mockAccounts).mockResolvedValueOnce(mockChainId)

      const result = await ConnectorUtil.fetchProviderData(browserWalletConnector)

      expect(result).toEqual({
        accounts: mockAccounts,
        chainId: 1
      })

      expect(mockProvider.request).toHaveBeenCalledTimes(2)
      expect(mockProvider.request).toHaveBeenNthCalledWith(1, { method: 'eth_accounts' })
      expect(mockProvider.request).toHaveBeenNthCalledWith(2, { method: 'eth_chainId' })
    })
  })

  describe('getCappedRecommendedWallets', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should return empty when no wc connector, no injected connectors, and no custom wallets', () => {
      const originalConnectors = ConnectorControllerRelative.state.connectors
      const originalCustomWallets = OptionsControllerRelative.state.customWallets
      const originalFeaturedWalletIds = OptionsControllerRelative.state.featuredWalletIds

      ConnectorControllerRelative.state.connectors = []
      OptionsControllerRelative.state.customWallets = undefined
      OptionsControllerRelative.state.featuredWalletIds = []

      const recommended = [{ id: 'w1', name: 'Wallet 1' }] as unknown as WcWallet[]
      const result = ConnectorUtil.getCappedRecommendedWallets(recommended)

      ConnectorControllerRelative.state.connectors = originalConnectors
      OptionsControllerRelative.state.customWallets = originalCustomWallets
      OptionsControllerRelative.state.featuredWalletIds = originalFeaturedWalletIds

      expect(result).toEqual([])
    })

    it('should cap recommended to fill remaining slots up to 4', () => {
      const WC = {
        id: 'walletConnect',
        type: 'EXTERNAL',
        name: 'WalletConnect',
        chain: { id: 'eip155:1' }
      } as unknown as ConnectorWithProviders
      const originalConnectors = ConnectorControllerRelative.state.connectors
      const originalCustomWallets = OptionsControllerRelative.state.customWallets
      const originalFeaturedWalletIds = OptionsControllerRelative.state.featuredWalletIds

      ConnectorControllerRelative.state.connectors = [WC] as any
      OptionsControllerRelative.state.customWallets = [{ id: 'c1' }] as unknown as any[]
      OptionsControllerRelative.state.featuredWalletIds = ['f1']
      vi.spyOn(OptionsUtil, 'isEmailEnabled').mockReturnValue(false)
      vi.spyOn(OptionsUtil, 'isSocialsEnabled').mockReturnValue(false)
      vi.spyOn(WalletUtil, 'filterOutDuplicateWallets').mockImplementation(w => w)

      const recommended = [
        { id: 'w1', name: 'Wallet 1' },
        { id: 'w2', name: 'Wallet 2' },
        { id: 'w3', name: 'Wallet 3' }
      ] as unknown as WcWallet[]

      // featured(1) + custom(1) + injected(0) + email(0) + social(0) = 2 => slice 2
      const result = ConnectorUtil.getCappedRecommendedWallets(recommended)

      ConnectorControllerRelative.state.connectors = originalConnectors
      OptionsControllerRelative.state.customWallets = originalCustomWallets
      OptionsControllerRelative.state.featuredWalletIds = originalFeaturedWalletIds

      expect(result.map(w => w.id)).toEqual(['w1', 'w2'])
    })

    it('should return empty when displayed wallets are already 4 or more', () => {
      const WC = {
        id: 'walletConnect',
        type: 'EXTERNAL',
        name: 'WalletConnect',
        chain: { id: 'eip155:1' }
      } as unknown as ConnectorWithProviders
      const INJECTED_ONE = {
        id: 'inj-1',
        type: 'INJECTED',
        name: 'Injected One',
        chain: { id: 'eip155:1' }
      } as unknown as ConnectorWithProviders
      const originalConnectors = ConnectorControllerRelative.state.connectors
      const originalCustomWallets = OptionsControllerRelative.state.customWallets
      const originalFeaturedWalletIds = OptionsControllerRelative.state.featuredWalletIds

      ConnectorControllerRelative.state.connectors = [WC, INJECTED_ONE] as any
      OptionsControllerRelative.state.customWallets = [{ id: 'c1' }] as unknown as any[]
      OptionsControllerRelative.state.featuredWalletIds = ['f1']
      vi.spyOn(OptionsUtil, 'isEmailEnabled').mockReturnValue(true)
      vi.spyOn(OptionsUtil, 'isSocialsEnabled').mockReturnValue(true)
      const filterSpy = vi.spyOn(WalletUtil, 'filterOutDuplicateWallets')

      const recommended = [
        { id: 'w1', name: 'Wallet 1' },
        { id: 'w2', name: 'Wallet 2' }
      ] as unknown as WcWallet[]

      // featured(1) + custom(1) + injected(1) + email(1) + social(1) = 5 => slice 0
      const result = ConnectorUtil.getCappedRecommendedWallets(recommended)

      ConnectorControllerRelative.state.connectors = originalConnectors
      OptionsControllerRelative.state.customWallets = originalCustomWallets
      OptionsControllerRelative.state.featuredWalletIds = originalFeaturedWalletIds

      expect(result).toEqual([])
      expect(filterSpy).not.toHaveBeenCalled()
    })

    it('should ignore Browser Wallet and WalletConnect in injected count', () => {
      const WC = {
        id: 'walletConnect',
        type: 'EXTERNAL',
        name: 'WalletConnect',
        chain: { id: 'eip155:1' }
      } as unknown as ConnectorWithProviders
      const BROWSER_WALLET = {
        id: 'inj-browser',
        type: 'INJECTED',
        name: 'Browser Wallet',
        chain: { id: 'eip155:1' }
      } as unknown as ConnectorWithProviders
      const WC_INJECTED = {
        id: 'walletConnect',
        type: 'INJECTED',
        name: 'WalletConnect',
        chain: { id: 'eip155:1' }
      } as unknown as ConnectorWithProviders
      const originalConnectors = ConnectorControllerRelative.state.connectors
      const originalCustomWallets = OptionsControllerRelative.state.customWallets
      const originalFeaturedWalletIds = OptionsControllerRelative.state.featuredWalletIds

      ConnectorControllerRelative.state.connectors = [WC, BROWSER_WALLET, WC_INJECTED] as any
      OptionsControllerRelative.state.customWallets = []
      OptionsControllerRelative.state.featuredWalletIds = []
      vi.spyOn(OptionsUtil, 'isEmailEnabled').mockReturnValue(false)
      vi.spyOn(OptionsUtil, 'isSocialsEnabled').mockReturnValue(false)
      vi.spyOn(WalletUtil, 'filterOutDuplicateWallets').mockImplementation(w => w)

      const recommended = [
        { id: 'w1', name: 'Wallet 1' },
        { id: 'w2', name: 'Wallet 2' },
        { id: 'w3', name: 'Wallet 3' }
      ] as unknown as WcWallet[]

      // injected connectors include only Browser Wallet and WalletConnect => injected count = 0
      // featured(0) + custom(0) + injected(0) + email(0) + social(0) = 0 => slice 4
      const result = ConnectorUtil.getCappedRecommendedWallets(recommended)

      ConnectorControllerRelative.state.connectors = originalConnectors
      OptionsControllerRelative.state.customWallets = originalCustomWallets
      OptionsControllerRelative.state.featuredWalletIds = originalFeaturedWalletIds

      expect(result.map(w => w.id)).toEqual(['w1', 'w2', 'w3'])
    })

    it('should slice after duplicate filtering', () => {
      const WC = {
        id: 'walletConnect',
        type: 'EXTERNAL',
        name: 'WalletConnect',
        chain: { id: 'eip155:1' }
      } as unknown as ConnectorWithProviders
      const originalConnectors = ConnectorControllerRelative.state.connectors
      const originalCustomWallets = OptionsControllerRelative.state.customWallets
      const originalFeaturedWalletIds = OptionsControllerRelative.state.featuredWalletIds

      ConnectorControllerRelative.state.connectors = [WC] as any
      OptionsControllerRelative.state.customWallets = [{ id: 'c1' }] as unknown as any[]
      OptionsControllerRelative.state.featuredWalletIds = []
      vi.spyOn(OptionsUtil, 'isEmailEnabled').mockReturnValue(false)
      vi.spyOn(OptionsUtil, 'isSocialsEnabled').mockReturnValue(false)
      // Simulate duplicates being removed so only one remains before slice
      vi.spyOn(WalletUtil, 'filterOutDuplicateWallets').mockReturnValue([
        { id: 'w1', name: 'Wallet 1' }
      ] as unknown as WcWallet[])

      const recommended = [
        { id: 'w1', name: 'Wallet 1' },
        { id: 'w2', name: 'Wallet 2' },
        { id: 'w3', name: 'Wallet 3' }
      ] as unknown as WcWallet[]

      // featured(0) + custom(1) + injected(0) + email(0) + social(0) = 1 => slice 3
      // but filtered list has length 1, result should be that single wallet
      const result = ConnectorUtil.getCappedRecommendedWallets(recommended)

      ConnectorControllerRelative.state.connectors = originalConnectors
      OptionsControllerRelative.state.customWallets = originalCustomWallets
      OptionsControllerRelative.state.featuredWalletIds = originalFeaturedWalletIds

      expect(result.map(w => w.id)).toEqual(['w1'])
    })
  })
})
