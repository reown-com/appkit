import { describe, expect, it, vi } from 'vitest'

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
  it('should have valid default state', () => {
    expect(TransactionsController.state).toEqual(defaultState)
  })

  it('should fetch onramp transactions and group them appropiately', async () => {
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

    await TransactionsController.fetchTransactions(accountAddress, 'meld')

    expect(fetchTransactions).toHaveBeenCalledWith({
      account: accountAddress,
      onramp: 'meld',
      cursor: undefined,
      cache: 'no-cache'
    })

    expect(TransactionsController.state.transactions).toEqual([
      ONRAMP_TRANSACTIONS_RESPONSES_JAN.SUCCESS,
      ONRAMP_TRANSACTIONS_RESPONSES_FEB.FAILED
    ])
    expect(TransactionsController.state.transactionsByYear).toEqual({})
  })

  it('should update onramp transaction from pending to success', async () => {
    const { SUCCESS, IN_PROGRESS } = ONRAMP_TRANSACTIONS_RESPONSES_FEB
    const accountAddress = SUCCESS.metadata.sentTo

    const pendingResponse = {
      data: [IN_PROGRESS] as Transaction[],
      next: ''
    }

    const fetchTransactions = vi
      .spyOn(BlockchainApiController, 'fetchTransactions')
      .mockResolvedValue(pendingResponse)

    await TransactionsController.fetchTransactions(accountAddress, 'meld')

    expect(fetchTransactions).toHaveBeenCalledWith({
      account: accountAddress,
      onramp: 'meld',
      cursor: undefined,
      cache: 'no-cache'
    })

    expect(TransactionsController.state.transactions).toEqual([])
    expect(TransactionsController.state.transactionsByYear).toEqual({})

    // Update the transaction
    const successResponse = {
      data: [SUCCESS] as Transaction[],
      next: ''
    }

    fetchTransactions.mockResolvedValue(successResponse)

    await TransactionsController.fetchTransactions(accountAddress, 'meld')

    expect(fetchTransactions).toHaveBeenCalledWith({
      account: accountAddress,
      onramp: 'meld',
      cursor: undefined,
      cache: 'no-cache'
    })

    // Transaction should be replaced
    expect(TransactionsController.state.transactions).toEqual([SUCCESS])
    expect(TransactionsController.state.transactionsByYear).toEqual({})
  })

  it('should update onramp transaction from pending to failed', async () => {
    const { FAILED, IN_PROGRESS } = ONRAMP_TRANSACTIONS_RESPONSES_FEB
    const accountAddress = FAILED.metadata.sentTo

    const pendingResponse = {
      data: [IN_PROGRESS] as Transaction[],
      next: ''
    }

    const fetchTransactions = vi
      .spyOn(BlockchainApiController, 'fetchTransactions')
      .mockResolvedValue(pendingResponse)

    await TransactionsController.fetchTransactions(accountAddress, 'meld')

    expect(fetchTransactions).toHaveBeenCalledWith({
      account: accountAddress,
      onramp: 'meld',
      cursor: undefined,
      cache: 'no-cache'
    })

    expect(TransactionsController.state.transactions).toEqual([])
    expect(TransactionsController.state.transactionsByYear).toEqual({})

    // Update the transaction
    const successResponse = {
      data: [FAILED] as Transaction[],
      next: ''
    }

    fetchTransactions.mockResolvedValue(successResponse)

    await TransactionsController.fetchTransactions(accountAddress, 'meld')

    expect(fetchTransactions).toHaveBeenCalledWith({
      account: accountAddress,
      onramp: 'meld',
      cursor: undefined,
      cache: 'no-cache'
    })

    // Transaction should be replaced
    expect(TransactionsController.state.transactions).toEqual([FAILED])
    expect(TransactionsController.state.transactionsByYear).toEqual({})
  })

  it('should push new onramp transactions while updating old ones', async () => {
    const { SUCCESS, IN_PROGRESS } = ONRAMP_TRANSACTIONS_RESPONSES_JAN
    const accountAddress = SUCCESS.metadata.sentTo

    const pendingResponse = {
      data: [IN_PROGRESS] as Transaction[],
      next: ''
    }

    const fetchTransactions = vi
      .spyOn(BlockchainApiController, 'fetchTransactions')
      .mockResolvedValue(pendingResponse)

    await TransactionsController.fetchTransactions(accountAddress, 'meld')

    expect(fetchTransactions).toHaveBeenCalledWith({
      account: accountAddress,
      onramp: 'meld',
      cursor: undefined,
      cache: 'no-cache'
    })

    expect(TransactionsController.state.transactions).toEqual([IN_PROGRESS])
    expect(TransactionsController.state.transactionsByYear).toEqual({})

    // Update the transaction
    const successResponse = {
      data: [SUCCESS, ONRAMP_TRANSACTIONS_RESPONSES_FEB.IN_PROGRESS] as Transaction[],
      next: ''
    }

    fetchTransactions.mockResolvedValue(successResponse)

    await TransactionsController.fetchTransactions(accountAddress, 'meld')

    expect(fetchTransactions).toHaveBeenCalledWith({
      account: accountAddress,
      onramp: 'meld',
      cursor: undefined,
      cache: 'no-cache'
    })

    // Transaction should be replaced
    expect(TransactionsController.state.transactions).toEqual([
      SUCCESS,
      ONRAMP_TRANSACTIONS_RESPONSES_FEB.IN_PROGRESS
    ])
    expect(TransactionsController.state.transactionsByYear).toEqual({})
  })

  it('should clear cursor correctly', async () => {
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
      onramp: undefined,
      cache: undefined
    })
    expect(TransactionsController.state.next).toBe('cursor')
  })

  it('should call fetchTransactions with chainId', async () => {
    const fetchTransactions = vi
      .spyOn(BlockchainApiController, 'fetchTransactions')
      .mockResolvedValue({
        data: [],
        next: 'cursor'
      })

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeCaipNetwork: {
        id: 1,
        caipNetworkId: 'eip155:1'
      }
    } as any)

    await TransactionsController.fetchTransactions('0x123', 'meld')
    expect(fetchTransactions).toHaveBeenCalledWith({
      account: '0x123',
      cursor: 'cursor',
      onramp: 'meld',
      cache: 'no-cache',
      chainId: 'eip155:1'
    })
  })
})
