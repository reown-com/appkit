import { describe, it, expect, vi } from 'vitest'
import { SolHelpersUtil } from '../src/solana/SolanaHelpersUtils.js'
import { SolConstantsUtil } from '../src/solana/SolanaConstantsUtil.js'
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { CaipNetwork } from '@reown/appkit-common'
import type { Provider } from '../src/solana/SolanaTypesUtil.js'

describe('SolHelpersUtil', () => {
  const mockChains: CaipNetwork[] = [
    {
      id: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      name: 'Solana Mainnet',
      caipNetworkId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      chainNamespace: CommonConstantsUtil.CHAIN.SOLANA,
      rpcUrls: {
        default: {
          http: ['https://api.mainnet-beta.solana.com']
        }
      },
      nativeCurrency: {
        name: 'Solana',
        decimals: 9,
        symbol: 'SOL'
      },
      blockExplorers: {
        default: {
          name: 'Solscan',
          url: 'https://solscan.io'
        }
      }
    },
    {
      id: '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
      name: 'Solana Testnet',
      caipNetworkId: 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
      chainNamespace: CommonConstantsUtil.CHAIN.SOLANA,
      rpcUrls: {
        default: {
          http: ['https://api.testnet.solana.com']
        }
      },
      nativeCurrency: {
        name: 'Solana',
        decimals: 9,
        symbol: 'SOL'
      },
      blockExplorers: {
        default: {
          name: 'Solscan',
          url: 'https://solscan.io'
        }
      }
    }
  ]

  describe('detectRpcUrl', () => {
    it('should append projectId for blockchain API RPC URLs', () => {
      const chain = {
        ...mockChains[0],
        rpcUrl: 'https://solana.blockchain-api.com/v1/rpc'
      } as CaipNetwork
      const projectId = 'test-project-id'
      const result = SolHelpersUtil.detectRpcUrl(chain, projectId)
      expect(result).toBe(chain.rpcUrls.default.http[0])
    })

    it('should return original RPC URL for non-blockchain API URLs', () => {
      const chain = mockChains[0]
      const projectId = 'test-project-id'
      const result = SolHelpersUtil.detectRpcUrl(chain!, projectId)
      expect(result).toBe(chain?.rpcUrls.default.http[0])
    })
  })

  describe('getChain', () => {
    it('should return the correct chain when chainId matches', () => {
      const result = SolHelpersUtil.getChain(mockChains, '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')
      expect(result).toEqual(mockChains[0])
    })

    it('should return the default chain when chainId does not match', () => {
      const result = SolHelpersUtil.getChain(mockChains, 'non-existent-chain-id')
      expect(result).toEqual(SolConstantsUtil.DEFAULT_CHAIN)
    })
  })

  describe('hexStringToNumber', () => {
    it('should convert hex string to number', () => {
      expect(SolHelpersUtil.hexStringToNumber('0xa')).toBe(10)
      expect(SolHelpersUtil.hexStringToNumber('ff')).toBe(255)
    })

    it('should handle hex strings with or without 0x prefix', () => {
      expect(SolHelpersUtil.hexStringToNumber('0x10')).toBe(16)
      expect(SolHelpersUtil.hexStringToNumber('10')).toBe(16)
    })
  })

  describe('getAddress', () => {
    it('should return the public key as a base58 string', () => {
      const mockProvider = {
        publicKey: {
          toBase58: vi.fn().mockReturnValue('mockAddress')
        }
      } as unknown as Provider

      const result = SolHelpersUtil.getAddress(mockProvider)
      expect(result).toBe('mockAddress')
      expect(mockProvider.publicKey?.toBase58).toHaveBeenCalled()
    })

    it('should return undefined if publicKey is not available', () => {
      const mockProvider = {} as Provider
      const result = SolHelpersUtil.getAddress(mockProvider)
      expect(result).toBeUndefined()
    })
  })
})
