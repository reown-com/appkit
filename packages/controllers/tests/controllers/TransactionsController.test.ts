import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Transaction } from '@reown/appkit-common'

import {
  BlockchainApiController,
  ChainController,
  OptionsController,
  TransactionsController
} from '../../exports/index.js'
import {
  ONRAMP_TRANSACTIONS_RESPONSES_FEB,
  ONRAMP_TRANSACTIONS_RESPONSES_JAN
} from '../constants/OnrampTransactions.js'

// -- Constants ----------------------------------------------------------------
const projectId = '123'
OptionsController.state.projectId = projectId
const defaultState = {
  transactions: [],
  transactionsByYear: {},
  loading: false,
  empty: false,
  next: undefined
}

// -- Tests --------------------------------------------------------------------
describe('TransactionsController', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeCaipNetwork: {
        id: 137,
        caipNetworkId: 'eip155:137'
      }
    } as any)
  })

  it('should have valid default state', () => {
    TransactionsController.state.transactions = []
    TransactionsController.state.transactionsByYear = {}
    expect(TransactionsController.state).toEqual(defaultState)
  })

  it('should fetch onramp transactions and group them appropiately', async () => {
    TransactionsController.state.transactions = []
    TransactionsController.state.transactionsByYear = {}

    const accountAddress = ONRAMP_TRANSACTIONS_RESPONSES_JAN.SUCCESS.metadata.sentTo

    const response = {
      data: [
        ONRAMP_TRANSACTIONS_RESPONSES_JAN.SUCCESS,
        ONRAMP_TRANSACTIONS_RESPONSES_FEB.FAILED
      ] as Transaction[],
      next: ''
    }

    const fetchTransactions = vi
      .spyOn(BlockchainApiController, 'fetchTransactions')
      .mockResolvedValue(response)

    await TransactionsController.fetchTransactions(accountAddress)

    expect(fetchTransactions).toHaveBeenCalledWith({
      account: accountAddress,
      cursor: undefined,
      chainId: 'eip155:137'
    })

    expect(TransactionsController.state.transactions).toEqual([
      ONRAMP_TRANSACTIONS_RESPONSES_JAN.SUCCESS,
      ONRAMP_TRANSACTIONS_RESPONSES_FEB.FAILED
    ])
    expect(TransactionsController.state.transactionsByYear).toEqual({
      2024: {
        0: [ONRAMP_TRANSACTIONS_RESPONSES_JAN.SUCCESS],
        1: [ONRAMP_TRANSACTIONS_RESPONSES_FEB.FAILED]
      }
    })
  })

  it('should update onramp transaction from pending to success', async () => {
    TransactionsController.state.transactions = []
    TransactionsController.state.transactionsByYear = {}
    const { SUCCESS, IN_PROGRESS } = ONRAMP_TRANSACTIONS_RESPONSES_FEB
    const accountAddress = SUCCESS.metadata.sentTo

    const pendingResponse = {
      data: [IN_PROGRESS] as Transaction[],
      next: ''
    }

    const fetchTransactions = vi
      .spyOn(BlockchainApiController, 'fetchTransactions')
      .mockResolvedValue(pendingResponse)

    await TransactionsController.fetchTransactions(accountAddress)

    expect(fetchTransactions).toHaveBeenCalledWith({
      account: accountAddress,
      cursor: undefined,
      chainId: 'eip155:137'
    })

    expect(TransactionsController.state.transactions).toEqual([IN_PROGRESS])
    expect(TransactionsController.state.transactionsByYear).toEqual({
      2024: {
        1: [IN_PROGRESS]
      }
    })

    // Update the transaction
    const successResponse = {
      data: [SUCCESS] as Transaction[],
      next: ''
    }

    fetchTransactions.mockResolvedValue(successResponse)

    await TransactionsController.fetchTransactions(accountAddress)

    expect(fetchTransactions).toHaveBeenCalledWith({
      account: accountAddress,
      cursor: undefined,
      chainId: 'eip155:137'
    })

    // Transaction should be replaced
    expect(TransactionsController.state.transactions).toEqual([IN_PROGRESS, SUCCESS])
    expect(TransactionsController.state.transactionsByYear).toEqual({
      2024: {
        1: [SUCCESS]
      }
    })
  })

  it('should update onramp transaction from pending to failed', async () => {
    TransactionsController.state.transactions = []
    TransactionsController.state.transactionsByYear = {}
    const { FAILED, IN_PROGRESS } = ONRAMP_TRANSACTIONS_RESPONSES_FEB
    const accountAddress = FAILED.metadata.sentTo

    const pendingResponse = {
      data: [IN_PROGRESS] as Transaction[],
      next: ''
    }

    const fetchTransactions = vi
      .spyOn(BlockchainApiController, 'fetchTransactions')
      .mockResolvedValue(pendingResponse)

    await TransactionsController.fetchTransactions(accountAddress)

    expect(fetchTransactions).toHaveBeenCalledWith({
      account: accountAddress,
      cursor: undefined,
      chainId: 'eip155:137'
    })

    expect(TransactionsController.state.transactions).toEqual([IN_PROGRESS])
    expect(TransactionsController.state.transactionsByYear).toEqual({
      2024: {
        1: [IN_PROGRESS]
      }
    })

    // Update the transaction
    const successResponse = {
      data: [FAILED] as Transaction[],
      next: ''
    }

    fetchTransactions.mockResolvedValue(successResponse)

    await TransactionsController.fetchTransactions(accountAddress)

    expect(fetchTransactions).toHaveBeenCalledWith({
      account: accountAddress,
      cursor: undefined,
      chainId: 'eip155:137'
    })

    // Transaction should be replaced
    expect(TransactionsController.state.transactions).toEqual([IN_PROGRESS, FAILED])
    expect(TransactionsController.state.transactionsByYear).toEqual({
      2024: {
        1: [FAILED]
      }
    })
  })

  it('should push new onramp transactions while updating old ones', async () => {
    TransactionsController.state.transactions = []
    TransactionsController.state.transactionsByYear = {}
    const { SUCCESS, IN_PROGRESS } = ONRAMP_TRANSACTIONS_RESPONSES_JAN
    const accountAddress = SUCCESS.metadata.sentTo

    const pendingResponse = {
      data: [IN_PROGRESS] as Transaction[],
      next: ''
    }

    const fetchTransactions = vi
      .spyOn(BlockchainApiController, 'fetchTransactions')
      .mockResolvedValue(pendingResponse)

    await TransactionsController.fetchTransactions(accountAddress)

    expect(fetchTransactions).toHaveBeenCalledWith({
      account: accountAddress,
      cursor: undefined,
      chainId: 'eip155:137'
    })

    expect(TransactionsController.state.transactions).toEqual([IN_PROGRESS])
    expect(TransactionsController.state.transactionsByYear).toEqual({
      2024: {
        0: [IN_PROGRESS]
      }
    })

    // Update the transaction
    const successResponse = {
      data: [SUCCESS, ONRAMP_TRANSACTIONS_RESPONSES_FEB.IN_PROGRESS] as Transaction[],
      next: ''
    }

    fetchTransactions.mockResolvedValue(successResponse)

    await TransactionsController.fetchTransactions(accountAddress)

    expect(fetchTransactions).toHaveBeenCalledWith({
      account: accountAddress,
      cursor: undefined,
      chainId: 'eip155:137'
    })

    // Transaction should be replaced
    expect(TransactionsController.state.transactions).toEqual([
      IN_PROGRESS,
      SUCCESS,
      ONRAMP_TRANSACTIONS_RESPONSES_FEB.IN_PROGRESS
    ])
    expect(TransactionsController.state.transactionsByYear).toEqual({
      2024: {
        0: [SUCCESS],
        1: [ONRAMP_TRANSACTIONS_RESPONSES_FEB.IN_PROGRESS]
      }
    })
  })

  it('should clear cursor correctly', async () => {
    TransactionsController.state.transactions = []
    TransactionsController.state.transactionsByYear = {}
    // Mock fetch transactions
    const fetchTransactions = vi
      .spyOn(BlockchainApiController, 'fetchTransactions')
      .mockResolvedValue({
        data: [],
        next: 'cursor'
      })

    // Fetch transactions
    await TransactionsController.fetchTransactions('0x123')
    expect(TransactionsController.state.next).toBe('cursor')

    TransactionsController.clearCursor()
    expect(TransactionsController.state.next).toBeUndefined()

    // Fetch transactions again
    await TransactionsController.fetchTransactions('0x123')
    expect(fetchTransactions).toHaveBeenCalledWith({
      account: '0x123',
      cursor: undefined,
      chainId: 'eip155:137'
    })
    expect(TransactionsController.state.next).toBe('cursor')
  })
})
