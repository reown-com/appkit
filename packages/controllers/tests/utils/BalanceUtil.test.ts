import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type Address, ConstantsUtil, type Hex } from '@reown/appkit-common'

import { ConnectorController } from '../../exports'
import { BlockchainApiController } from '../../src/controllers/BlockchainApiController'
import { type AccountState } from '../../src/controllers/ChainController'
import { ChainController } from '../../src/controllers/ChainController'
import { ConnectionController } from '../../src/controllers/ConnectionController'
import { BalanceUtil } from '../../src/utils/BalanceUtil'
import { ERC7811Utils, type WalletGetAssetsResponse } from '../../src/utils/ERC7811Util'
import { StorageUtil } from '../../src/utils/StorageUtil'
import { ViemUtil } from '../../src/utils/ViemUtil'

vi.mock('../../src/controllers/BlockchainApiController')
vi.mock('../../src/controllers/ChainController')
vi.mock('../../src/controllers/ConnectionController')
vi.mock('../../src/utils/ERC7811Util')
vi.mock('../../src/utils/StorageUtil')
vi.mock('../../src/utils/ViemUtil')

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

describe('BalanceUtil', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue(ConstantsUtil.CONNECTOR_ID.AUTH)
  })

  describe('getMyTokensWithBalance', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        address: mockEthereumAddress
      } as AccountState)
      ChainController.state.activeCaipNetwork = mockEthereumNetwork
      vi.mocked(ERC7811Utils.getChainIdHexFromCAIP2ChainId).mockReturnValue(mockEthChainIdAsHex)
      ConnectorController.state.activeConnectorIds = {
        eip155: ConstantsUtil.CONNECTOR_ID.AUTH,
        solana: undefined,
        polkadot: undefined,
        bip122: undefined,
        cosmos: undefined,
        sui: undefined,
        stacks: undefined,
        ton: undefined
      }
      vi.mocked(StorageUtil.getBalanceCacheForCaipAddress).mockReturnValue(undefined)
    })

    it('should return empty array when address is missing', async () => {
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        address: undefined
      } as AccountState)
      const result = await BalanceUtil.getMyTokensWithBalance()
      expect(result).toEqual([])
    })

    it('should use ERC7811 for EIP155 chain when wallet_getAssets is available', async () => {
      const mockAssetsResponse: WalletGetAssetsResponse = {
        [mockEthChainIdAsHex]: [
          {
            address: mockEthereumAddress as Address,
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

      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        address: mockEthereumAddress
      } as AccountState)
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

      const result = await BalanceUtil.getMyTokensWithBalance()
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

      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        address: mockSolanaAddress
      } as AccountState)
      ChainController.state.activeCaipNetwork = mockSolanaNetwork
      vi.mocked(BlockchainApiController.getBalance).mockResolvedValue({ balances: mockBalances })

      const result = await BalanceUtil.getMyTokensWithBalance()

      expect(BlockchainApiController.getBalance).toHaveBeenCalledWith(
        mockSolanaAddress,
        mockSolanaNetwork.caipNetworkId,
        undefined
      )
      expect(result).toEqual(mockBalances)
    })

    it('should use BlockchainApi if connector is not auth', async () => {
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

      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        address: mockEthereumAddress
      } as AccountState)
      ChainController.state.activeCaipNetwork = mockEthereumNetwork
      vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue(
        ConstantsUtil.CONNECTOR_ID.INJECTED
      )
      vi.mocked(BlockchainApiController.getBalance).mockResolvedValue({ balances: mockBalances })

      const result = await BalanceUtil.getMyTokensWithBalance()

      expect(BlockchainApiController.getBalance).toHaveBeenCalledWith(
        mockEthereumAddress,
        mockEthereumNetwork.caipNetworkId,
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

      const result = await BalanceUtil.getMyTokensWithBalance()

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

      const result = await BalanceUtil.getMyTokensWithBalance()

      expect(result).toEqual([mockBalances[0]])
    })

    it('should return cached balance from storage if it exists', async () => {
      const mockCachedBalance = {
        balances: [
          {
            symbol: 'ETH',
            quantity: { decimals: '18', numeric: '1.0' },
            name: 'Ethereum',
            chainId: mockEthChainIdAsHex,
            price: 3200,
            iconUrl: 'https://example.com/icon.png'
          }
        ],
        timestamp: Date.now()
      }

      vi.mocked(StorageUtil.getBalanceCacheForCaipAddress).mockReturnValue(mockCachedBalance)

      const result = await BalanceUtil.getMyTokensWithBalance()

      expect(StorageUtil.getBalanceCacheForCaipAddress).toHaveBeenCalledWith(
        `${mockEthereumNetwork.caipNetworkId}:${mockEthereumAddress}`
      )
      expect(result).toEqual(mockCachedBalance.balances)
      expect(ConnectionController.walletGetAssets).not.toHaveBeenCalled()
      expect(BlockchainApiController.getBalance).not.toHaveBeenCalled()
    })
  })

  describe('getEIP155Balances', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        address: mockEthereumAddress
      } as AccountState)
      ChainController.state.activeCaipNetwork = mockEthereumNetwork
      ConnectorController.state.activeConnectorIds = {
        eip155: ConstantsUtil.CONNECTOR_ID.AUTH,
        solana: undefined,
        polkadot: undefined,
        bip122: undefined,
        cosmos: undefined,
        sui: undefined,
        stacks: undefined,
        ton: undefined
      }
      vi.mocked(ERC7811Utils.getChainIdHexFromCAIP2ChainId).mockReturnValue(mockEthChainIdAsHex)
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

      const result = await BalanceUtil.getEIP155Balances(mockEthereumAddress, mockEthereumNetwork)

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

      const result = await BalanceUtil.getEIP155Balances(mockEthereumAddress, mockEthereumNetwork)

      expect(result).toBeNull()
    })

    it('should return assets when walletGetAssetsResponse contains chainIdHex', async () => {
      const mockAssetsResponse = {
        [mockEthChainIdAsHex]: [
          {
            address: mockEthereumAddress as Address,
            balance: '0xDE0B6B3A7640000' as Hex,
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

      const result = await BalanceUtil.getEIP155Balances(mockEthereumAddress, mockEthereumNetwork)

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

      const result = await BalanceUtil.getEIP155Balances(mockEthereumAddress, mockEthereumNetwork)

      expect(result).toEqual([])
    })

    it('should save balance to storage after fetching', async () => {
      const mockAssetsResponse = {
        [mockEthChainIdAsHex]: [
          {
            address: mockEthereumAddress as Address,
            balance: '0xDE0B6B3A7640000' as Hex,
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

      const result = await BalanceUtil.getEIP155Balances(mockEthereumAddress, mockEthereumNetwork)

      expect(StorageUtil.updateBalanceCache).toHaveBeenCalledWith({
        caipAddress: `${mockEthereumNetwork.caipNetworkId}:${mockEthereumAddress}`,
        balance: { balances: [mockBalance] },
        timestamp: expect.any(Number)
      })
      expect(result).toEqual([mockBalance])
    })
  })

  describe('fetchERC20Balance', () => {
    const mockCaipAddress = 'eip155:1:0x1234567890123456789012345678901234567890'
    const mockAssetAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
    const mockCaipNetwork = mockEthereumNetwork
    const mockAddress = '0x1234567890123456789012345678901234567890'

    let mockPublicClient: any

    beforeEach(() => {
      vi.restoreAllMocks()

      mockPublicClient = {
        multicall: vi.fn()
      }

      vi.mocked(ViemUtil.createViemPublicClient).mockReturnValue(mockPublicClient)
    })

    it('should successfully fetch ERC20 balance with valid data', async () => {
      const mockMulticallResult = [
        { result: 'Test Token' },
        { result: 'TEST' },
        { result: BigInt('1000000000000000000') },
        { result: 18 }
      ]

      mockPublicClient.multicall.mockResolvedValue(mockMulticallResult)

      const result = await BalanceUtil.fetchERC20Balance({
        caipAddress: mockCaipAddress,
        assetAddress: mockAssetAddress,
        caipNetwork: mockCaipNetwork
      })

      expect(ViemUtil.createViemPublicClient).toHaveBeenCalledWith(mockCaipNetwork)
      expect(mockPublicClient.multicall).toHaveBeenCalledWith({
        contracts: [
          {
            address: mockAssetAddress,
            functionName: 'name',
            args: [],
            abi: expect.any(Object)
          },
          {
            address: mockAssetAddress,
            functionName: 'symbol',
            args: [],
            abi: expect.any(Object)
          },
          {
            address: mockAssetAddress,
            functionName: 'balanceOf',
            args: [mockAddress],
            abi: expect.any(Object)
          },
          {
            address: mockAssetAddress,
            functionName: 'decimals',
            args: [],
            abi: expect.any(Object)
          }
        ]
      })

      expect(result).toEqual({
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18,
        balance: '1'
      })
    })

    it('should return zero balance when balance is zero', async () => {
      const mockMulticallResult = [
        { result: 'Test Token' },
        { result: 'TEST' },
        { result: BigInt('0') },
        { result: 18 }
      ]

      mockPublicClient.multicall.mockResolvedValue(mockMulticallResult)

      const result = await BalanceUtil.fetchERC20Balance({
        caipAddress: mockCaipAddress,
        assetAddress: mockAssetAddress,
        caipNetwork: mockCaipNetwork
      })

      expect(result).toEqual({
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18,
        balance: '0'
      })
    })

    it('should return zero balance when balance or decimals are null', async () => {
      const mockMulticallResult = [
        { result: 'Test Token' },
        { result: 'TEST' },
        { result: null },
        { result: 18 }
      ]

      mockPublicClient.multicall.mockResolvedValue(mockMulticallResult)

      const result = await BalanceUtil.fetchERC20Balance({
        caipAddress: mockCaipAddress,
        assetAddress: mockAssetAddress,
        caipNetwork: mockCaipNetwork
      })

      expect(result).toEqual({
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18,
        balance: '0'
      })
    })

    it('should return zero balance when decimals are undefined', async () => {
      const mockMulticallResult = [
        { result: 'Test Token' },
        { result: 'TEST' },
        { result: BigInt('1000000000000000000') },
        { result: undefined }
      ]

      mockPublicClient.multicall.mockResolvedValue(mockMulticallResult)

      const result = await BalanceUtil.fetchERC20Balance({
        caipAddress: mockCaipAddress,
        assetAddress: mockAssetAddress,
        caipNetwork: mockCaipNetwork
      })

      expect(result).toEqual({
        name: 'Test Token',
        symbol: 'TEST',
        decimals: undefined,
        balance: '0'
      })
    })

    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network error')
      mockPublicClient.multicall.mockRejectedValue(networkError)

      await expect(
        BalanceUtil.fetchERC20Balance({
          caipAddress: mockCaipAddress,
          assetAddress: mockAssetAddress,
          caipNetwork: mockCaipNetwork
        })
      ).rejects.toThrow('Network error')

      expect(ViemUtil.createViemPublicClient).toHaveBeenCalledWith(mockCaipNetwork)
      expect(mockPublicClient.multicall).toHaveBeenCalled()
    })

    it('should handle different decimal values correctly', async () => {
      const mockMulticallResult = [
        { result: 'USDC Token' },
        { result: 'USDC' },
        { result: BigInt('1000000') },
        { result: 6 }
      ]

      mockPublicClient.multicall.mockResolvedValue(mockMulticallResult)

      const result = await BalanceUtil.fetchERC20Balance({
        caipAddress: mockCaipAddress,
        assetAddress: mockAssetAddress,
        caipNetwork: mockCaipNetwork
      })

      expect(result).toEqual({
        name: 'USDC Token',
        symbol: 'USDC',
        decimals: 6,
        balance: '1'
      })
    })

    it('should handle large balance values correctly', async () => {
      const mockMulticallResult = [
        { result: 'Large Token' },
        { result: 'LARGE' },
        { result: BigInt('123456789012345678901234567890') },
        { result: 18 }
      ]

      mockPublicClient.multicall.mockResolvedValue(mockMulticallResult)

      const result = await BalanceUtil.fetchERC20Balance({
        caipAddress: mockCaipAddress,
        assetAddress: mockAssetAddress,
        caipNetwork: mockCaipNetwork
      })

      expect(result).toEqual({
        name: 'Large Token',
        symbol: 'LARGE',
        decimals: 18,
        balance: '123456789012.34567890123456789'
      })
    })
  })
})
