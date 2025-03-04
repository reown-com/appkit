import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Balance } from '@reown/appkit-common'

import { AccountController } from '../../src/controllers/AccountController'
import { BlockchainApiController } from '../../src/controllers/BlockchainApiController'
import { ChainController } from '../../src/controllers/ChainController'
import { ConnectionController } from '../../src/controllers/ConnectionController'
import { ERC7811Utils, type WalletGetAssetsResponse } from '../../src/utils/ERC7811Util'
import { SendApiUtil } from '../../src/utils/SendApiUtil'

vi.mock('../../src/controllers/AccountController')
vi.mock('../../src/controllers/BlockchainApiController')
vi.mock('../../src/controllers/ChainController')
vi.mock('../../src/controllers/ConnectionController')
vi.mock('../../src/utils/ERC7811Util')

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
const mockEthereumAddress = '0x1234567890123456789012345678901234567890'
const mockEthChainIdAsHex = '0x1'

describe('SendApiUtil', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getMyTokensWithBalance', () => {
    beforeEach(() => {
      AccountController.state.address = mockEthereumAddress
      ChainController.state.activeCaipNetwork = mockEthereumNetwork
      vi.mocked(ERC7811Utils.getChainIdHexFromCAIP2ChainId).mockReturnValue(mockEthChainIdAsHex)
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should return empty array when address is missing', async () => {
      AccountController.state.address = undefined
      const result = await SendApiUtil.getMyTokensWithBalance()
      expect(result).toEqual([])
    })

    it('should return empty array when network is missing', async () => {
      ChainController.state.activeCaipNetwork = undefined
      const result = await SendApiUtil.getMyTokensWithBalance()
      expect(result).toEqual([])
    })

    it('should use ERC7811 for EIP155 chain when wallet_getAssets is available', async () => {
      const mockAssetsResponse: WalletGetAssetsResponse = {
        [mockEthChainIdAsHex]: [
          {
            address: mockEthereumAddress as `0x${string}`,
            balance: '0xDE0B6B3A7640000',
            type: 'NATIVE',
            metadata: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
              value: 0.0001,
              price: 3200,
              iconUrl: 'https://example.com/icon.png'
            }
          }
        ]
      }

      AccountController.state.address = mockEthereumAddress
      ChainController.state.activeCaipNetwork = mockEthereumNetwork
      const mockBalance = {
        symbol: 'ETH',
        quantity: { decimals: '18', numeric: '0.0001' },
        name: 'Ethereum',
        chainId: mockEthChainIdAsHex,
        price: 3200,
        iconUrl: 'https://example.com/icon.png'
      }

      vi.mocked(ConnectionController.getCapabilities).mockResolvedValue({
        [mockEthChainIdAsHex]: {
          assetDiscovery: {
            supported: true
          }
        }
      })
      vi.mocked(ConnectionController.walletGetAssets).mockResolvedValue(mockAssetsResponse)
      vi.mocked(ERC7811Utils.isWalletGetAssetsResponse).mockReturnValue(true)
      vi.mocked(ERC7811Utils.createBalance).mockReturnValue(mockBalance)

      const result = await SendApiUtil.getMyTokensWithBalance()
      expect(ConnectionController.walletGetAssets).toHaveBeenCalledWith({
        account: mockEthereumAddress,
        chainFilter: [mockEthChainIdAsHex]
      })
      expect(result).toEqual([mockBalance])
    })

    it('should use BlockchainApi for Solana chain', async () => {
      const mockSolanaAddress = 'solana123'
      const mockBalances = [
        {
          symbol: 'SOL',
          quantity: { decimals: '9', numeric: '1.0' },
          name: 'Solana',
          chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
          price: 0,
          iconUrl: ''
        }
      ]

      AccountController.state.address = mockSolanaAddress
      ChainController.state.activeCaipNetwork = mockSolanaNetwork
      vi.mocked(BlockchainApiController.getBalance).mockResolvedValue({ balances: mockBalances })

      const result = await SendApiUtil.getMyTokensWithBalance()

      expect(BlockchainApiController.getBalance).toHaveBeenCalledWith(
        mockSolanaAddress,
        mockSolanaNetwork.caipNetworkId,
        undefined
      )
      expect(result).toEqual(mockBalances)
    })

    it('should use BlockchainApi when wallet_getAssets is not available', async () => {
      const mockBalances = [
        {
          symbol: 'ETH',
          quantity: { decimals: '18', numeric: '1.0' },
          name: 'Ethereum',
          chainId: mockEthChainIdAsHex,
          price: 0,
          iconUrl: ''
        }
      ]

      vi.mocked(ConnectionController.getCapabilities).mockResolvedValue({})
      vi.mocked(BlockchainApiController.getBalance).mockResolvedValue({ balances: mockBalances })

      const result = await SendApiUtil.getMyTokensWithBalance()

      expect(BlockchainApiController.getBalance).toHaveBeenCalledWith(
        mockEthereumAddress,
        mockEthereumNetwork.caipNetworkId,
        undefined
      )
      expect(result).toEqual(mockBalances)
    })

    it('should filter out zero decimal balances', async () => {
      const mockBalances = [
        {
          symbol: 'ETH',
          quantity: { decimals: '18', numeric: '1.0' },
          name: 'Ethereum',
          chainId: mockEthChainIdAsHex,
          price: 0,
          iconUrl: ''
        },
        {
          symbol: 'TEST',
          quantity: { decimals: '0', numeric: '0' },
          name: 'Test Token',
          chainId: mockEthChainIdAsHex,
          price: 0,
          iconUrl: ''
        }
      ]

      vi.mocked(BlockchainApiController.getBalance).mockResolvedValue({ balances: mockBalances })

      const result = await SendApiUtil.getMyTokensWithBalance()

      expect(result).toEqual([mockBalances[0]])
    })
  })

  describe('mapBalancesToSwapTokens', () => {
    afterEach(() => {
      vi.clearAllMocks()
    })

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

      vi.spyOn(ChainController, 'getActiveNetworkTokenAddress').mockReturnValue('0x789')

      const result = SendApiUtil.mapBalancesToSwapTokens(mockBalances as Balance[])

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
      const mockNetworkTokenAddress = '0x789'
      vi.spyOn(ChainController, 'getActiveNetworkTokenAddress').mockReturnValue(
        mockNetworkTokenAddress
      )

      const result = SendApiUtil.mapBalancesToSwapTokens(mockBalances as Balance[])

      expect(result[0]?.address).toBe(mockNetworkTokenAddress)
    })

    it('should handle empty balances', () => {
      const result = SendApiUtil.mapBalancesToSwapTokens([])
      expect(result).toEqual([])
    })

    it('should handle undefined balances', () => {
      const result = SendApiUtil.mapBalancesToSwapTokens(undefined as unknown as Balance[])
      expect(result).toEqual([])
    })
  })

  describe('getEIP155Balances', () => {
    beforeEach(() => {
      AccountController.state.address = mockEthereumAddress
      ChainController.state.activeCaipNetwork = mockEthereumNetwork
      vi.mocked(ERC7811Utils.getChainIdHexFromCAIP2ChainId).mockReturnValue(mockEthChainIdAsHex)
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should return null when walletGetAssetsResponse is invalid', async () => {
      const invalidResponse = { invalid: 'response' }

      vi.mocked(ConnectionController.getCapabilities).mockResolvedValue({
        [mockEthChainIdAsHex]: {
          assetDiscovery: {
            supported: true
          }
        }
      })
      vi.mocked(ConnectionController.walletGetAssets).mockResolvedValue(invalidResponse)
      vi.mocked(ERC7811Utils.isWalletGetAssetsResponse).mockReturnValue(false) // Mock the type guard to return false

      const result = await SendApiUtil.getEIP155Balances(mockEthereumAddress, mockEthereumNetwork)

      expect(result).toBeNull()
    })

    it('should return null when asset discovery fails', async () => {
      const errorMessage = 'Network error'

      vi.mocked(ConnectionController.getCapabilities).mockResolvedValue({
        [mockEthChainIdAsHex]: {
          assetDiscovery: {
            supported: true
          }
        }
      })
      vi.mocked(ConnectionController.walletGetAssets).mockRejectedValue(new Error(errorMessage))

      const result = await SendApiUtil.getEIP155Balances(mockEthereumAddress, mockEthereumNetwork)

      expect(result).toBeNull()
    })

    it('should return assets when walletGetAssetsResponse contains chainIdHex', async () => {
      const mockAssetsResponse = {
        [mockEthChainIdAsHex]: [
          {
            address: mockEthereumAddress as `0x${string}`,
            balance: '0xDE0B6B3A7640000' as `0x${string}`,
            type: 'NATIVE' as const,
            metadata: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
              value: 0.0001,
              price: 3200,
              iconUrl: 'https://example.com/icon.png'
            }
          }
        ]
      }

      vi.mocked(ConnectionController.getCapabilities).mockResolvedValue({
        [mockEthChainIdAsHex]: {
          assetDiscovery: {
            supported: true
          }
        }
      })
      vi.mocked(ConnectionController.walletGetAssets).mockResolvedValue(mockAssetsResponse)
      vi.mocked(ERC7811Utils.isWalletGetAssetsResponse).mockReturnValue(true) // Mock the type guard to return true
      vi.mocked(ERC7811Utils.createBalance).mockReturnValue({
        symbol: 'ETH',
        quantity: { decimals: '18', numeric: '0.0001' },
        name: 'Ethereum',
        chainId: mockEthChainIdAsHex,
        price: 3200,
        iconUrl: 'https://example.com/icon.png'
      })

      const result = await SendApiUtil.getEIP155Balances(mockEthereumAddress, mockEthereumNetwork)

      expect(result).toBeDefined()
      expect(result).toHaveLength(1)
      expect(result).not.toBeNull()
      if (result) {
        expect(result[0]).toMatchObject({
          symbol: 'ETH',
          quantity: { decimals: '18', numeric: '0.0001' },
          name: 'Ethereum',
          chainId: mockEthChainIdAsHex,
          price: 3200,
          iconUrl: 'https://example.com/icon.png'
        })
      }
    })

    it('should return an empty array when walletGetAssetsResponse does not contain chainIdHex', async () => {
      const mockAssetsResponse = {
        '0x2': []
      }

      vi.mocked(ConnectionController.getCapabilities).mockResolvedValue({
        [mockEthChainIdAsHex]: {
          assetDiscovery: {
            supported: true
          }
        }
      })
      vi.mocked(ConnectionController.walletGetAssets).mockResolvedValue(mockAssetsResponse)
      vi.mocked(ERC7811Utils.isWalletGetAssetsResponse).mockReturnValue(true)

      const result = await SendApiUtil.getEIP155Balances(mockEthereumAddress, mockEthereumNetwork)

      expect(result).toEqual([])
    })
  })
})
