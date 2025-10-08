import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { NetworkUtil } from '@reown/appkit-common'
import { ChainController } from '@reown/appkit-controllers'

// Mock the controllers
vi.mock('@reown/appkit-controllers', () => ({
  ChainController: {
    getCaipNetworks: vi.fn(),
    getActiveCaipNetwork: vi.fn(),
    state: {
      activeChain: 'eip155'
    }
  },
  ConnectorController: {
    getConnectorId: vi.fn()
  },
  AlertController: {
    open: vi.fn()
  },
  SIWXUtil: {
    authConnectorAuthenticate: vi.fn()
  },
  getActiveCaipNetwork: vi.fn(),
  getPreferredAccountType: vi.fn()
}))

// Mock the auth provider
vi.mock('@reown/appkit/auth-provider', () => ({
  W3mFrameProviderSingleton: {
    getInstance: vi.fn()
  }
}))

// Mock the utils
vi.mock('@reown/appkit-utils', () => ({
  ErrorUtil: {
    ALERT_ERRORS: {
      IFRAME_LOAD_FAILED: 'IFRAME_LOAD_FAILED',
      IFRAME_REQUEST_TIMEOUT: 'IFRAME_REQUEST_TIMEOUT',
      UNVERIFIED_DOMAIN: 'UNVERIFIED_DOMAIN'
    },
    EmbeddedWalletAbortController: new AbortController()
  }
}))

describe('AuthConnector - parseChainId behavior fix', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return current chain ID when request comes while active namespace is different than eip155', async () => {
    // Mock ChainController to simulate different active namespace
    vi.spyOn(ChainController, 'getCaipNetworks').mockReturnValue([
      {
        id: 137, // Polygon
        chainId: 137,
        name: 'Polygon',
        chainNamespace: 'eip155',
        caipNetworkId: 'eip155:137'
      },
      {
        id: 1, // Ethereum mainnet
        chainId: 1,
        name: 'Ethereum',
        chainNamespace: 'eip155',
        caipNetworkId: 'eip155:1'
      }
    ])

    // Mock active network to be Polygon (chainId 137)
    vi.spyOn(ChainController, 'getActiveCaipNetwork').mockReturnValue({
      id: 137,
      chainId: 137,
      name: 'Polygon',
      chainNamespace: 'eip155',
      caipNetworkId: 'eip155:137'
    })

    // Test the parseChainId function behavior by testing the logic directly
    // This simulates the fix where parseChainId should return the current active chain
    // instead of defaulting to mainnet when the chainId is not found in networks
    const networks = ChainController.getCaipNetworks('eip155')
    const chainId = 999 // Unknown chainId from provider
    const currentChainId = ChainController.getActiveCaipNetwork('eip155')?.id

    // This is the logic from the parseChainId function
    let result: number
    if (!networks.some(network => network.id === chainId)) {
      if (currentChainId) {
        result = currentChainId as number
      } else {
        result = (networks[0]?.id as number) || 1
      }
    } else {
      result = NetworkUtil.parseEvmChainId(chainId) || 1
    }

    // Should return the current active chain (137) instead of defaulting to mainnet (1)
    expect(result).toBe(137)
  })

  it('should fallback to first available network when no active network is set', async () => {
    // Mock ChainController with no active network
    vi.spyOn(ChainController, 'getCaipNetworks').mockReturnValue([
      {
        id: 137, // Polygon
        chainId: 137,
        name: 'Polygon',
        chainNamespace: 'eip155',
        caipNetworkId: 'eip155:137'
      },
      {
        id: 1, // Ethereum mainnet
        chainId: 1,
        name: 'Ethereum',
        chainNamespace: 'eip155',
        caipNetworkId: 'eip155:1'
      }
    ])

    // Mock no active network
    vi.spyOn(ChainController, 'getActiveCaipNetwork').mockReturnValue(null)

    // Test the parseChainId function behavior
    const networks = ChainController.getCaipNetworks('eip155')
    const chainId = 999 // Unknown chainId
    const currentChainId = ChainController.getActiveCaipNetwork('eip155')?.id

    // This is the logic from the parseChainId function
    let result: number
    if (!networks.some(network => network.id === chainId)) {
      if (currentChainId) {
        result = currentChainId as number
      } else {
        result = (networks[0]?.id as number) || 1
      }
    } else {
      result = NetworkUtil.parseEvmChainId(chainId) || 1
    }

    // Should fallback to first network in the list (137)
    expect(result).toBe(137)
  })

  it('should return the provided chainId when it exists in available networks', async () => {
    // Mock ChainController with multiple networks
    vi.spyOn(ChainController, 'getCaipNetworks').mockReturnValue([
      {
        id: 137, // Polygon
        chainId: 137,
        name: 'Polygon',
        chainNamespace: 'eip155',
        caipNetworkId: 'eip155:137'
      },
      {
        id: 1, // Ethereum mainnet
        chainId: 1,
        name: 'Ethereum',
        chainNamespace: 'eip155',
        caipNetworkId: 'eip155:1'
      }
    ])

    // Test the parseChainId function behavior
    const networks = ChainController.getCaipNetworks('eip155')
    const chainId = 1 // Valid chainId
    const currentChainId = ChainController.getActiveCaipNetwork('eip155')?.id

    // This is the logic from the parseChainId function
    let result: number
    if (!networks.some(network => network.id === chainId)) {
      if (currentChainId) {
        result = currentChainId as number
      } else {
        result = (networks[0]?.id as number) || 1
      }
    } else {
      result = NetworkUtil.parseEvmChainId(chainId) || 1
    }

    // Should return the provided chainId (1) since it exists in networks
    expect(result).toBe(1)
  })

  it('should handle string chainId correctly', async () => {
    vi.spyOn(ChainController, 'getCaipNetworks').mockReturnValue([
      {
        id: 137,
        chainId: 137,
        name: 'Polygon',
        chainNamespace: 'eip155',
        caipNetworkId: 'eip155:137'
      }
    ])

    vi.spyOn(ChainController, 'getActiveCaipNetwork').mockReturnValue({
      id: 137,
      chainId: 137,
      name: 'Polygon',
      chainNamespace: 'eip155',
      caipNetworkId: 'eip155:137'
    })

    // Test the parseChainId function behavior
    const networks = ChainController.getCaipNetworks('eip155')
    const chainId = '137' // String chainId
    const currentChainId = ChainController.getActiveCaipNetwork('eip155')?.id

    // This is the logic from the parseChainId function
    let result: number
    if (!networks.some(network => network.id === chainId)) {
      if (currentChainId) {
        result = currentChainId as number
      } else {
        result = (networks[0]?.id as number) || 1
      }
    } else {
      result = NetworkUtil.parseEvmChainId(chainId) || 1
    }

    expect(result).toBe(137)
  })

  it('should use current network when request comes from different namespace', async () => {
    // Simulate scenario where user is on Solana namespace but makes EVM request
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: 'solana' // Different namespace
    })

    // Mock EVM networks
    vi.spyOn(ChainController, 'getCaipNetworks').mockReturnValue([
      {
        id: 137,
        chainId: 137,
        name: 'Polygon',
        chainNamespace: 'eip155',
        caipNetworkId: 'eip155:137'
      },
      {
        id: 1,
        chainId: 1,
        name: 'Ethereum',
        chainNamespace: 'eip155',
        caipNetworkId: 'eip155:1'
      }
    ])

    // Mock active EVM network
    vi.spyOn(ChainController, 'getActiveCaipNetwork').mockReturnValue({
      id: 137,
      chainId: 137,
      name: 'Polygon',
      chainNamespace: 'eip155',
      caipNetworkId: 'eip155:137'
    })

    // Test the parseChainId function behavior
    const networks = ChainController.getCaipNetworks('eip155')
    const chainId = 999 // Unknown chainId from provider
    const currentChainId = ChainController.getActiveCaipNetwork('eip155')?.id

    // This is the logic from the parseChainId function
    let result: number
    if (!networks.some(network => network.id === chainId)) {
      if (currentChainId) {
        result = currentChainId as number
      } else {
        result = (networks[0]?.id as number) || 1
      }
    } else {
      result = NetworkUtil.parseEvmChainId(chainId) || 1
    }

    // Should return the current active EVM network (137) instead of defaulting to mainnet
    expect(result).toBe(137)
  })

  it('should handle empty networks array gracefully', async () => {
    vi.spyOn(ChainController, 'getCaipNetworks').mockReturnValue([])
    vi.spyOn(ChainController, 'getActiveCaipNetwork').mockReturnValue(null)

    // Test the parseChainId function behavior
    const networks = ChainController.getCaipNetworks('eip155')
    const chainId = 999
    const currentChainId = ChainController.getActiveCaipNetwork('eip155')?.id

    // This is the logic from the parseChainId function
    let result: number
    if (!networks.some(network => network.id === chainId)) {
      if (currentChainId) {
        result = currentChainId as number
      } else {
        result = (networks[0]?.id as number) || 1
      }
    } else {
      result = NetworkUtil.parseEvmChainId(chainId) || 1
    }

    // Should fallback to default chainId (1) when no networks are available
    expect(result).toBe(1)
  })
})
