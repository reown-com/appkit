import { describe, it, expect, vi } from 'vitest'
import { SolHelpersUtil } from '../src/solana/SolanaHelpersUtils'
import { SolConstantsUtil } from '../src/solana/SolanaConstantsUtil'
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { CaipNetwork } from '@reown/appkit-common'
import type { Provider } from '../src/solana/SolanaTypesUtil'

describe('SolHelpersUtil', () => {
  const mockChains: CaipNetwork[] = [
    {
      id: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      name: 'Solana Mainnet',
      chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      chainNamespace: CommonConstantsUtil.CHAIN.SOLANA,
      rpcUrl: 'https://api.mainnet-beta.solana.com',
      currency: 'SOL'
    },
    {
      id: 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
      name: 'Solana Testnet',
      chainId: '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
      chainNamespace: CommonConstantsUtil.CHAIN.SOLANA,
      rpcUrl: 'https://api.testnet.solana.com',
      currency: 'SOL'
    }
  ]

  describe('detectRpcUrl', () => {
    it('should append projectId for blockchain API RPC URLs', () => {
      const chain = {
        ...mockChains[0],
        rpcUrl: 'https://solana.blockchain-api.com/v1/rpc'
      }
      const projectId = 'test-project-id'
      const result = SolHelpersUtil.detectRpcUrl(chain, projectId)
      expect(result).toBe(`${chain.rpcUrl}?chainId=solana:${chain.chainId}&projectId=${projectId}`)
    })

    it('should return original RPC URL for non-blockchain API URLs', () => {
      const chain = mockChains[0]
      const projectId = 'test-project-id'
      const result = SolHelpersUtil.detectRpcUrl(chain, projectId)
      expect(result).toBe(chain.rpcUrl)
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

  describe('getChainFromCaip', () => {
    it('should return the correct chain for a valid CAIP ID', () => {
      const result = SolHelpersUtil.getChainFromCaip(
        mockChains,
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
      )
      expect(result).toEqual({
        ...mockChains[0],
        id: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        imageId: 'a1b58899-f671-4276-6a5e-56ca5bd59700',
        chainNamespace: CommonConstantsUtil.CHAIN.SOLANA
      })
    })

    it('should return the default chain for an invalid CAIP ID', () => {
      const result = SolHelpersUtil.getChainFromCaip(mockChains, 'invalid:chain')
      expect(result).toEqual({
        ...SolConstantsUtil.DEFAULT_CHAIN,
        id: 'solana:chain',
        imageId: undefined,
        chainNamespace: CommonConstantsUtil.CHAIN.SOLANA
      })
    })
  })

  describe('getCaipDefaultChain', () => {
    it('should return undefined for undefined input', () => {
      const result = SolHelpersUtil.getCaipDefaultChain(undefined)
      expect(result).toBeUndefined()
    })

    it('should convert chain to CAIP format', () => {
      const result = SolHelpersUtil.getCaipDefaultChain(mockChains[0])
      expect(result).toEqual({
        id: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        name: 'Solana Mainnet',
        imageId: 'a1b58899-f671-4276-6a5e-56ca5bd59700',
        chainNamespace: CommonConstantsUtil.CHAIN.SOLANA
      })
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
