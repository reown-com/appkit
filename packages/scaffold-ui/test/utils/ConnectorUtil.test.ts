import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ApiController,
  ConnectionController,
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
        enableWalletConnect: true,
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
        enableWalletConnect: true,
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
        enableWalletConnect: true,
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

    it('should handle disabled walletConnect connector properly', () => {
      vi.spyOn(ConnectorUtil, 'getIsConnectedWithWC').mockReturnValue(false)
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        enableWalletConnect: false,
        features: {
          connectorTypeOrder: ['walletConnect', 'injected']
        }
      })

      const result = ConnectorUtil.getConnectorTypeOrder({
        recommended: [],
        featured: [],
        custom: [],
        recent: [],
        announced: [],
        injected: [INJECTED],
        multiChain: [],
        external: []
      })

      expect(result).toEqual(['injected'])
      expect(result).not.toContain('walletConnect')
    })

    it('should handle already connected walletConnect properly', () => {
      vi.spyOn(ConnectorUtil, 'getIsConnectedWithWC').mockReturnValue(true)
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        enableWalletConnect: true,
        features: {
          connectorTypeOrder: ['walletConnect', 'injected']
        }
      })

      const result = ConnectorUtil.getConnectorTypeOrder({
        recommended: [],
        featured: [],
        custom: [],
        recent: [],
        announced: [],
        injected: [INJECTED],
        multiChain: [INJECTED],
        external: []
      })

      expect(result).toEqual(['injected'])
      expect(result).not.toContain('walletConnect')
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
})
