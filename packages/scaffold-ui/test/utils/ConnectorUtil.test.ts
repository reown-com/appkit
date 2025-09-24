import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConstantsUtil } from '@reown/appkit-common'
import {
  ApiController,
  ConnectionController,
  type Connector,
  type ConnectorWithProviders,
  CoreHelperUtil,
  OptionsController,
  type WcWallet
} from '@reown/appkit-controllers'

import { ConnectorUtil } from '../../src/utils/ConnectorUtil'

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
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        features: {
          connectorTypeOrder: ['injected', 'walletConnect']
        }
      })

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
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        features: {
          connectorTypeOrder: ['injected', 'walletConnect']
        }
      })

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
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        features: {
          connectorTypeOrder: ['injected', 'recommended']
        }
      })

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
      vi.spyOn(ConnectionController, 'checkInstalled').mockReturnValue(true)

      expect(ConnectorUtil.showConnector(INJECTED_CONNECTOR)).toBe(true)
    })

    it('should hide injected connector when not installed and no rdns', () => {
      vi.spyOn(ConnectionController, 'checkInstalled').mockReturnValue(false)

      expect(ConnectorUtil.showConnector({ ...INJECTED_CONNECTOR, info: undefined })).toBe(false)
    })

    it('should hide connector when rdns is excluded', () => {
      vi.spyOn(ApiController.state, 'excludedWallets', 'get').mockReturnValue([
        { rdns: 'browser.wallet', name: 'Test Wallet' }
      ])

      expect(ConnectorUtil.showConnector(INJECTED_CONNECTOR)).toBe(false)
    })

    it('should hide connector when name is excluded', () => {
      vi.spyOn(ApiController.state, 'excludedWallets', 'get').mockReturnValue([
        { name: 'Browser Wallet', rdns: 'test.wallet' }
      ])

      expect(ConnectorUtil.showConnector(INJECTED_CONNECTOR)).toBe(false)
    })

    it('should hide announced connector when excluded with rdns', () => {
      vi.spyOn(ApiController.state, 'excludedWallets', 'get').mockReturnValue([
        { rdns: 'announced.wallet', name: 'Announced Wallet' }
      ])

      expect(ConnectorUtil.showConnector(ANNOUNCED_CONNECTOR)).toBe(false)
    })

    it('should hide announced connector when excluded with name', () => {
      vi.spyOn(ApiController.state, 'excludedWallets', 'get').mockReturnValue([
        { name: 'Announced Wallet', rdns: 'announced' }
      ])

      expect(ConnectorUtil.showConnector(ANNOUNCED_CONNECTOR)).toBe(false)
    })

    it('should show injected connector when not excluded', () => {
      vi.spyOn(ApiController.state, 'excludedWallets', 'get').mockReturnValue([])

      expect(ConnectorUtil.showConnector(INJECTED_CONNECTOR)).toBe(true)
    })

    it('should show announced connector when not excluded', () => {
      vi.spyOn(ApiController.state, 'excludedWallets', 'get').mockReturnValue([])

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
})
