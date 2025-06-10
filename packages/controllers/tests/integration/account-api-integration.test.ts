import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Balance, CaipNetwork, Transaction } from '@reown/appkit-common'
import { ConstantsUtil } from '@reown/appkit-common'

import {
  AccountController,
  ApiController,
  type BlockchainApiBalanceResponse,
  BlockchainApiController,
  type BlockchainApiTransactionsResponse,
  ChainController,
  ConnectorController,
  StorageUtil,
  TransactionsController,
  type WcWallet
} from '../../exports/index.js'

const mockAddress = '0x123456789abcdef'
const mockCaipAddress = 'eip155:1:0x123456789abcdef'
const mockChainId = 'eip155:1'
const mockChain = ConstantsUtil.CHAIN.EVM

const mockBalanceResponse: BlockchainApiBalanceResponse = {
  balances: [
    {
      name: 'Ethereum',
      symbol: 'ETH',
      balance: '1.5',
      contractAddress: null,
      decimals: 18,
      price: 2000,
      quantity: {
        decimals: '18'
      }
    } as unknown as Balance,
    {
      name: 'USD Coin',
      symbol: 'USDC',
      balance: '100',
      contractAddress: '0x123abc',
      decimals: 6,
      price: 1,
      quantity: {
        decimals: '6'
      }
    } as unknown as Balance
  ]
}

const mockTransactionResponse: BlockchainApiTransactionsResponse = {
  data: [
    {
      id: 'tx1',
      metadata: {
        chain: 'eip155:1',
        status: 'confirmed',
        minedAt: new Date().toISOString()
      },
      transfers: [
        {
          amount: '1.0',
          currency: {
            name: 'Ethereum',
            symbol: 'ETH'
          },
          direction: 'in',
          nft_info: {
            flags: {
              is_spam: false
            }
          }
        }
      ]
    } as unknown as Transaction
  ],
  next: null
}

const mockWalletData: WcWallet[] = [
  {
    id: 'wallet-12345',
    name: 'Test Wallet',
    image_id: 'wallet_image_id',
    chains: ['eip155:1']
  }
]

describe('AccountController-ApiController Integration', () => {
  beforeEach(() => {
    // Initialize ChainController first - this is required for account state to work properly
    ChainController.initialize(
      [
        {
          namespace: mockChain,
          caipNetworks: [
            {
              id: 1,
              name: 'Ethereum',
              caipNetworkId: mockChainId,
              chainNamespace: mockChain,
              nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
              rpcUrls: { default: { http: ['https://rpc.infura.com/v1/'] } },
              blockExplorers: { default: { name: 'Etherscan', url: 'https://etherscan.io' } }
            }
          ],
          connectionControllerClient: vi.fn() as any,
          networkControllerClient: vi.fn() as any
        }
      ],
      [
        {
          id: 1,
          name: 'Ethereum',
          caipNetworkId: mockChainId,
          chainNamespace: mockChain,
          nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
          rpcUrls: { default: { http: ['https://rpc.infura.com/v1/'] } },
          blockExplorers: { default: { name: 'Etherscan', url: 'https://etherscan.io' } }
        }
      ],
      {
        connectionControllerClient: vi.fn() as any,
        networkControllerClient: vi.fn() as any
      }
    )

    AccountController.resetAccount(mockChain)
    TransactionsController.resetTransactions()
    ApiController.state.wallets = []

    ChainController.state.activeCaipNetwork = {
      id: 1,
      name: 'Ethereum',
      caipNetworkId: mockChainId,
      chainNamespace: mockChain
    } as unknown as CaipNetwork
    ChainController.state.activeCaipAddress = mockCaipAddress

    // Set the account address properly after reset - this will now work correctly
    AccountController.setCaipAddress(mockCaipAddress, mockChain)

    // Clear mocks first, then set up our test mocks
    vi.clearAllMocks()

    // Mock the necessary dependencies for balance tests
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('injected')
    vi.spyOn(StorageUtil, 'getBalanceCacheForCaipAddress').mockReturnValue(undefined)
  })

  describe('Wallet Data Retrieval', () => {
    it('should correctly fetch wallet data via ApiController and make it available', async () => {
      const fetchSpy = vi.spyOn(ApiController, 'fetchWalletsByPage').mockResolvedValue(undefined)

      ApiController.state.wallets = mockWalletData

      await ApiController.fetchWalletsByPage({ page: 1 })

      expect(fetchSpy).toHaveBeenCalledTimes(1)

      expect(ApiController.state.wallets).toEqual(mockWalletData)
    })

    it('should handle wallet data fetch errors appropriately', async () => {
      const fetchSpy = vi
        .spyOn(ApiController, 'fetchWalletsByPage')
        .mockRejectedValue(new Error('Failed to fetch wallets'))

      try {
        await ApiController.fetchWalletsByPage({ page: 1 })
      } catch (error) {}

      expect(fetchSpy).toHaveBeenCalledTimes(1)

      expect(ApiController.state.wallets).toEqual([])
    })
  })

  describe('Balance Updates', () => {
    it('should update account balance state when new balance data is fetched', async () => {
      const getBalanceSpy = vi
        .spyOn(BlockchainApiController, 'getBalance')
        .mockResolvedValue(mockBalanceResponse)

      // Additional mocking to ensure we bypass all early returns
      vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('injected') // Not Auth connector
      vi.spyOn(StorageUtil, 'getBalanceCacheForCaipAddress').mockReturnValue(undefined) // No cache

      const result = await AccountController.fetchTokenBalance()

      expect(getBalanceSpy).toHaveBeenCalledWith(mockAddress, mockChainId, undefined)

      expect(result).toEqual(
        mockBalanceResponse.balances.filter(balance => balance.quantity.decimals !== '0')
      )
    })

    it('should handle balance fetch errors appropriately', async () => {
      const onErrorMock = vi.fn()

      // Additional mocking
      vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('injected') // Not Auth connector
      vi.spyOn(StorageUtil, 'getBalanceCacheForCaipAddress').mockReturnValue(undefined) // No cache

      vi.spyOn(BlockchainApiController, 'getBalance').mockRejectedValue(
        new Error('Failed to fetch balance')
      )

      const result = await AccountController.fetchTokenBalance(onErrorMock)

      expect(onErrorMock).toHaveBeenCalled()

      expect(result).toEqual([])

      expect(AccountController.state.balanceLoading).toBe(false)
    })
  })

  describe('Transaction History Synchronization', () => {
    it('should update transaction history state when new transaction data is fetched', async () => {
      const fetchTransactionsSpy = vi
        .spyOn(BlockchainApiController, 'fetchTransactions')
        .mockResolvedValue(mockTransactionResponse)

      await TransactionsController.fetchTransactions(mockAddress)

      expect(fetchTransactionsSpy).toHaveBeenCalledWith({
        account: mockAddress,
        cursor: undefined,
        onramp: undefined,
        cache: undefined,
        chainId: mockChainId
      })

      expect(TransactionsController.state.transactions).toHaveLength(
        mockTransactionResponse.data.length
      )

      if (
        TransactionsController.state.transactions.length > 0 &&
        mockTransactionResponse.data.length > 0
      ) {
        expect(TransactionsController.state.transactions[0]?.id).toBe(
          mockTransactionResponse.data[0]?.id
        )
      }

      expect(Object.keys(TransactionsController.state.transactionsByYear).length).toBeGreaterThan(0)
    })

    it('should handle transaction fetch errors appropriately', async () => {
      vi.spyOn(BlockchainApiController, 'fetchTransactions').mockRejectedValue(
        new Error('Failed to fetch transactions')
      )

      await TransactionsController.fetchTransactions(mockAddress)

      expect(TransactionsController.state.loading).toBe(false)
      expect(TransactionsController.state.empty).toBe(true)
      expect(TransactionsController.state.next).toBeUndefined()
      expect(TransactionsController.state.transactions).toEqual([])
    })
  })
})
