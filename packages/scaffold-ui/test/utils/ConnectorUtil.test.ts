import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OptionsController, type WcWallet } from '@reown/appkit-controllers'

import { ConnectorUtil } from '../../src/utils/ConnectorUtil'

const INJECTED = { id: 'injected' } as WcWallet
const RECENT = { id: 'recent' } as WcWallet
const FEATURED = { id: 'featured' } as WcWallet
const CUSTOM = { id: 'custom' } as WcWallet
const EXTERNAL = { id: 'external' } as WcWallet

describe('ConnectorUtil', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getConnectorPosition', () => {
    it('should return connector positions in order of overriddenConnectors first then enabled connectors', () => {
      vi.spyOn(ConnectorUtil, 'getIsConnectedWithWC').mockReturnValue(false)
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        enableWalletConnect: true,
        features: {
          connectorPosition: ['injected', 'walletConnect']
        }
      })

      const result = ConnectorUtil.getConnectorPosition({
        recommended: [],
        featured: [FEATURED],
        custom: [CUSTOM],
        recent: [RECENT],
        announced: [],
        injected: [INJECTED],
        multiChain: [],
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
          connectorPosition: ['injected', 'walletConnect']
        }
      })

      const result = ConnectorUtil.getConnectorPosition({
        recommended: [],
        featured: [FEATURED],
        custom: [CUSTOM],
        recent: [RECENT],
        announced: [],
        injected: [INJECTED],
        multiChain: [],
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
          connectorPosition: ['injected', 'recommended', 'announced', 'multiChain']
        }
      })

      const result = ConnectorUtil.getConnectorPosition({
        recommended: [],
        featured: [FEATURED],
        custom: [CUSTOM],
        recent: [RECENT],
        announced: [],
        injected: [INJECTED],
        multiChain: [],
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

      expect(result).not.toContain('recommended')
      expect(result).not.toContain('announced')
      expect(result).not.toContain('multiChain')
    })

    it('should handle disabled walletConnect connector properly', () => {
      vi.spyOn(ConnectorUtil, 'getIsConnectedWithWC').mockReturnValue(false)
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        enableWalletConnect: false,
        features: {
          connectorPosition: ['walletConnect', 'injected']
        }
      })

      const result = ConnectorUtil.getConnectorPosition({
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
          connectorPosition: ['walletConnect', 'injected']
        }
      })

      const result = ConnectorUtil.getConnectorPosition({
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
  })
})
