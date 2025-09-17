import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Balance } from '@reown/appkit-common'

import { BlockchainApiController } from '../../src/controllers/BlockchainApiController'
import { type AccountState } from '../../src/controllers/ChainController'
import { ChainController } from '../../src/controllers/ChainController'
import { ConnectionController } from '../../src/controllers/ConnectionController'
import { OptionsController } from '../../src/controllers/OptionsController'
import { SwapApiUtil } from '../../src/utils/SwapApiUtil'

// Mock the controllers
vi.mock('../../src/controllers/ChainController')
vi.mock('../../src/controllers/BlockchainApiController')
vi.mock('../../src/controllers/OptionsController')
vi.mock('../../src/controllers/ConnectionController')
vi.mock('../../src/controllers/ChainController')

const mockSolanaNetwork = {
  id: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  caipNetworkId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  chainNamespace: 'solana',
  name: 'Solana',
  nativeCurrency: {
    name: 'Solana',
    decimals: 9,
    symbol: 'SOL'
  },
  rpcUrls: {
    default: {
      http: ['https://api.mainnet-beta.solana.com']
    }
  }
} as const

const mockEthereumNetwork = {
  id: '1',
  chainNamespace: 'eip155',
  caipNetworkId: 'eip155:1',
  name: 'Ethereum',
  nativeCurrency: {
    name: 'Ethereum',
    decimals: 18,
    symbol: 'ETH'
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.infura.io/v3/YOUR-PROJECT-ID']
    }
  }
} as const

describe('SwapApiUtil', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getTokenList', () => {
    it('should return a list of tokens', async () => {
      const mockTokens = [{ address: '0x123', symbol: 'TEST', name: 'Test Token', decimals: 18 }]
      ChainController.state.activeCaipNetwork = mockEthereumNetwork
      OptionsController.state.projectId = 'test-project-id'
      BlockchainApiController.fetchSwapTokens = vi.fn().mockResolvedValue({ tokens: mockTokens })

      const result = await SwapApiUtil.getTokenList(mockEthereumNetwork.caipNetworkId)

      expect(BlockchainApiController.fetchSwapTokens).toHaveBeenCalledWith({
        chainId: 'eip155:1'
      })
      expect(result).toEqual([
        {
          ...mockTokens[0],
          eip2612: false,
          quantity: { decimals: '0', numeric: '0' },
          price: 0,
          value: 0
        }
      ])
    })

    it('should return an empty array if no tokens are fetched', async () => {
      BlockchainApiController.fetchSwapTokens = vi.fn().mockResolvedValue({ tokens: null })

      const result = await SwapApiUtil.getTokenList()

      expect(result).toEqual([])
    })
  })

  describe('fetchGasPrice', () => {
    it('should fetch gas price for EVM chain', async () => {
      ChainController.state.activeCaipNetwork = mockEthereumNetwork
      OptionsController.state.projectId = 'test-project-id'
      BlockchainApiController.fetchGasPrice = vi
        .fn()
        .mockResolvedValue({ standard: '20', fast: '25', instant: '30' })

      const result = await SwapApiUtil.fetchGasPrice()

      expect(BlockchainApiController.fetchGasPrice).toHaveBeenCalledWith({
        chainId: 'eip155:1'
      })
      expect(result).toEqual({ standard: '20', fast: '25', instant: '30' })
    })
    it('should fetch gas price for Solana chain', async () => {
      ChainController.state.activeCaipNetwork = mockSolanaNetwork
      ConnectionController.estimateGas = vi.fn().mockResolvedValue(5000)

      const result = await SwapApiUtil.fetchGasPrice()

      expect(ConnectionController.estimateGas).toHaveBeenCalledWith({ chainNamespace: 'solana' })
      expect(result).toEqual({ standard: '5000', fast: '5000', instant: '5000' })
    })
    it('should return null if there is an error', async () => {
      ChainController.state.activeCaipNetwork = {
        id: 1,
        chainNamespace: 'eip155',
        caipNetworkId: 'eip155:1',
        name: 'Ethereum',
        nativeCurrency: {
          name: 'Ethereum',
          decimals: 18,
          symbol: 'ETH'
        },
        rpcUrls: {
          default: {
            http: ['https://mainnet.infura.io/v3/YOUR-PROJECT-ID']
          }
        }
      }
      BlockchainApiController.fetchGasPrice = vi.fn().mockRejectedValue(new Error('API Error'))

      const result = await SwapApiUtil.fetchGasPrice()

      expect(result).toBeNull()
    })
  })

  describe('fetchSwapAllowance', () => {
    it('should fetch and return swap allowance', async () => {
      OptionsController.state.projectId = 'test-project-id'
      BlockchainApiController.fetchSwapAllowance = vi
        .fn()
        .mockResolvedValue({ allowance: '1000000000000000000' })
      ConnectionController.parseUnits = vi.fn().mockReturnValue(BigInt('500000000000000000'))

      const result = await SwapApiUtil.fetchSwapAllowance({
        tokenAddress: '0x123',
        userAddress: '0x456',
        sourceTokenAmount: '0.5',
        sourceTokenDecimals: 18
      })

      expect(BlockchainApiController.fetchSwapAllowance).toHaveBeenCalledWith({
        tokenAddress: '0x123',
        userAddress: '0x456'
      })
      expect(result).toBe(true)
    })

    it('should return false if allowance is less than source token amount', async () => {
      BlockchainApiController.fetchSwapAllowance = vi
        .fn()
        .mockResolvedValue({ allowance: '100000000000000000' })
      ConnectionController.parseUnits = vi.fn().mockReturnValue(BigInt('500000000000000000'))

      const result = await SwapApiUtil.fetchSwapAllowance({
        tokenAddress: '0x123',
        userAddress: '0x456',
        sourceTokenAmount: '0.5',
        sourceTokenDecimals: 18
      })

      expect(result).toBe(false)
    })
  })

  describe('getMyTokensWithBalance', () => {
    it('should fetch and return tokens with balance', async () => {
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        address: '0x123'
      } as AccountState)
      ChainController.state.activeCaipNetwork = mockEthereumNetwork
      BlockchainApiController.getBalance = vi.fn().mockResolvedValue({
        balances: [{ address: '0x456', quantity: { decimals: '18', numeric: '1.5' } }]
      })

      const result = await SwapApiUtil.getMyTokensWithBalance()

      expect(BlockchainApiController.getBalance).toHaveBeenCalledWith(
        '0x123',
        'eip155:1',
        undefined
      )
      expect(ChainController.setAccountProp).toHaveBeenCalled()
      expect(result).toEqual([
        {
          address: '0x456',
          quantity: { decimals: '18', numeric: '1.5' },
          decimals: 18,
          logoUri: undefined,
          eip2612: false
        }
      ])
    })
    it('should return an empty array if no address or active network', async () => {
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue(undefined)
      ChainController.state.activeCaipNetwork = undefined

      const result = await SwapApiUtil.getMyTokensWithBalance()

      expect(result).toEqual([])
    })
  })

  describe('mapBalancesToSwapTokens', () => {
    it('should map balances to swap tokens correctly', () => {
      const mockBalances = [
        {
          address: '0x123',
          symbol: 'ETH',
          quantity: { decimals: '18', numeric: '1.5' },
          iconUrl: 'https://example.com/icon.png',
          name: 'Ethereum',
          chainId: '0x1',
          price: 0
        }
      ]

      const result = SwapApiUtil.mapBalancesToSwapTokens(mockBalances as Balance[])

      expect(result).toEqual([
        {
          address: '0x123',
          symbol: 'ETH',
          quantity: { decimals: '18', numeric: '1.5' },
          iconUrl: 'https://example.com/icon.png',
          name: 'Ethereum',
          chainId: '0x1',
          price: 0,
          decimals: 18,
          logoUri: 'https://example.com/icon.png',
          eip2612: false
        }
      ])
    })

    it('should use network token address when balance address is undefined', () => {
      const mockBalances = [
        {
          symbol: 'ETH',
          quantity: { decimals: '18', numeric: '1.5' },
          name: 'Ethereum',
          chainId: '0x1',
          price: 0,
          iconUrl: 'https://example.com/icon.png'
        }
      ]

      const result = SwapApiUtil.mapBalancesToSwapTokens(mockBalances as Balance[])

      expect(result[0]?.address).toBe('eip155:1:0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
    })

    it('should handle empty balances', () => {
      const result = SwapApiUtil.mapBalancesToSwapTokens([])
      expect(result).toEqual([])
    })

    it('should handle undefined balances', () => {
      const result = SwapApiUtil.mapBalancesToSwapTokens(undefined as unknown as Balance[])
      expect(result).toEqual([])
    })
  })

  describe('handleSwapError', () => {
    it('should return "Insufficient liquidity" for insufficient liquidity error', async () => {
      const error = {
        cause: { json: async () => ({ reasons: [{ description: 'insufficient liquidity' }] }) }
      }

      const result = await SwapApiUtil.handleSwapError(error)

      expect(result).toBe('Insufficient liquidity')
    })

    it('should return undefined for other errors', async () => {
      const error = {
        cause: { json: async () => ({ reasons: [{ description: 'some other error' }] }) }
      }

      const result = await SwapApiUtil.handleSwapError(error)

      expect(result).toBeUndefined()
    })
  })
})
