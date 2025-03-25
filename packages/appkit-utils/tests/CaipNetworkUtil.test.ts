import { http } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type AppKitNetwork } from '@reown/appkit-common'

import { CaipNetworksUtil } from '../src/CaipNetworkUtil'

vi.mock('viem', () => ({
  http: vi.fn(),
  fallback: vi.fn()
}))

describe('CaipNetworksUtil', () => {
  // Test data
  const mockProjectId = 'test-project-id'
  const mainnet: AppKitNetwork = {
    id: 1,
    name: 'Ethereum',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: {
      default: {
        http: ['https://ethereum.example.com']
      }
    }
  }
  const polygon: AppKitNetwork = {
    id: 137,
    name: 'Polygon',
    nativeCurrency: {
      name: 'Polygon',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: {
      default: {
        http: ['https://polygon.example.com']
      }
    }
  }
  const solana: AppKitNetwork = {
    id: 'solana',
    name: 'Solana',
    chainNamespace: 'solana',
    caipNetworkId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    nativeCurrency: {
      name: 'Solana',
      symbol: 'SOL',
      decimals: 9
    },
    rpcUrls: {
      default: {
        http: ['https://solana.example.com']
      }
    }
  }

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  describe('extendRpcUrlWithProjectId', () => {
    it('should extend Reown RPC URL with project ID', () => {
      const rpcUrl = 'https://rpc.walletconnect.org/v1/'
      const result = CaipNetworksUtil.extendRpcUrlWithProjectId(rpcUrl, mockProjectId)
      expect(result).toContain('projectId=test-project-id')
    })

    it('should not modify non-Reown RPC URLs', () => {
      const rpcUrl = 'https://example.com/rpc'
      const result = CaipNetworksUtil.extendRpcUrlWithProjectId(rpcUrl, mockProjectId)
      expect(result).toBe(rpcUrl)
    })

    it('should handle invalid URLs gracefully', () => {
      const invalidUrl = 'not-a-url'
      const result = CaipNetworksUtil.extendRpcUrlWithProjectId(invalidUrl, mockProjectId)
      expect(result).toBe(invalidUrl)
    })
  })

  describe('isCaipNetwork', () => {
    it('should identify CaipNetwork correctly', () => {
      expect(CaipNetworksUtil.isCaipNetwork(solana)).toBe(true)
      expect(CaipNetworksUtil.isCaipNetwork(mainnet)).toBe(false)
    })
  })

  describe('getChainNamespace', () => {
    it('should return correct namespace for CaipNetwork', () => {
      expect(CaipNetworksUtil.getChainNamespace(solana)).toBe('solana')
    })

    it('should return EVM namespace for non-CaipNetwork', () => {
      expect(CaipNetworksUtil.getChainNamespace(mainnet)).toBe('eip155')
    })
  })

  describe('getCaipNetworkId', () => {
    it('should return existing caipNetworkId for CaipNetwork', () => {
      expect(CaipNetworksUtil.getCaipNetworkId(solana)).toBe(
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
      )
    })

    it('should construct caipNetworkId for non-CaipNetwork', () => {
      expect(CaipNetworksUtil.getCaipNetworkId(mainnet)).toBe('eip155:1')
      expect(CaipNetworksUtil.getCaipNetworkId(polygon)).toBe('eip155:137')
    })
  })

  describe('getDefaultRpcUrl', () => {
    it('should return blockchain API URL for supported chains', () => {
      const result = CaipNetworksUtil.getDefaultRpcUrl(
        solana,
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        mockProjectId
      )
      expect(result).toContain('rpc.walletconnect.org')
      expect(result).toContain('projectId=test-project-id')
    })

    it('should return default RPC URL for unsupported chains', () => {
      const customNetwork: AppKitNetwork = {
        id: 999,
        name: 'Custom Chain',
        nativeCurrency: {
          name: 'Custom',
          symbol: 'CUSTOM',
          decimals: 18
        },
        rpcUrls: {
          default: {
            http: ['https://custom.example.com']
          }
        }
      }
      const result = CaipNetworksUtil.getDefaultRpcUrl(customNetwork, 'eip155:999', mockProjectId)
      expect(result).toBe('https://custom.example.com')
    })

    it('should return empty string when no RPC URL is available', () => {
      const networkWithoutRpc: AppKitNetwork = {
        id: 999,
        name: 'No RPC Chain',
        nativeCurrency: {
          name: 'Custom',
          symbol: 'CUSTOM',
          decimals: 18
        },
        rpcUrls: {
          default: {
            http: []
          }
        }
      }
      const result = CaipNetworksUtil.getDefaultRpcUrl(
        networkWithoutRpc,
        'eip155:999',
        mockProjectId
      )
      expect(result).toBe('')
    })
  })

  describe('extendCaipNetwork', () => {
    const customNetworkImageUrls = {
      1: 'https://example.com/eth.png'
    }
    const customRpcUrls = {
      1: [{ url: 'https://custom.eth.example.com' }]
    }

    it('should extend network with all required properties', () => {
      const result = CaipNetworksUtil.extendCaipNetwork(mainnet, {
        customNetworkImageUrls,
        projectId: mockProjectId,
        customRpcUrls
      })

      expect(result).toMatchObject({
        chainNamespace: 'eip155',
        caipNetworkId: 'eip155:1',
        assets: {
          imageUrl: 'https://example.com/eth.png'
        }
      })
      expect(result.rpcUrls.default.http).toContain('https://custom.eth.example.com')
    })

    it('should handle networks without custom configurations', () => {
      const result = CaipNetworksUtil.extendCaipNetwork(mainnet, {
        customNetworkImageUrls: undefined,
        projectId: mockProjectId,
        customRpcUrls: undefined
      })

      expect(result).toHaveProperty('chainNamespace')
      expect(result).toHaveProperty('caipNetworkId')
      expect(result.assets?.imageUrl).toBeUndefined()
    })
  })

  describe('extendCaipNetworks', () => {
    it('should extend multiple networks correctly', () => {
      const networks = [mainnet, { ...mainnet, id: 2 }]
      const result = CaipNetworksUtil.extendCaipNetworks(networks, {
        customNetworkImageUrls: {},
        projectId: mockProjectId,
        customRpcUrls: {}
      })

      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('chainNamespace')
      expect(result[1]).toHaveProperty('chainNamespace')
    })
  })

  describe('getViemTransport', () => {
    it('should create transport with custom RPC URLs', () => {
      const customRpcUrls = [{ url: 'https://custom.example.com' }]
      CaipNetworksUtil.getViemTransport(solana, mockProjectId, customRpcUrls)

      expect(http).toHaveBeenCalledWith('https://custom.example.com', undefined)
      expect(http).toHaveBeenCalledWith(
        'https://rpc.walletconnect.org/v1/?chainId=solana%3A5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp&projectId=test-project-id',
        {
          fetchOptions: {
            headers: {
              'Content-Type': 'text/plain'
            }
          }
        }
      )
    })

    it('should include Reown transport for supported chains', () => {
      CaipNetworksUtil.getViemTransport(
        { ...mainnet, chainNamespace: 'eip155', caipNetworkId: 'eip155:1' },
        mockProjectId
      )

      expect(http).toHaveBeenCalledWith(
        'https://rpc.walletconnect.org/v1/?chainId=eip155%3A1&projectId=test-project-id',
        {
          fetchOptions: {
            headers: {
              'Content-Type': 'text/plain'
            }
          }
        }
      )
    })
  })
})
