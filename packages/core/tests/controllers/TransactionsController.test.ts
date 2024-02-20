import { describe, expect, it, vi } from 'vitest'
import { BlockchainApiController, OptionsController, TransactionsController } from '../../index.js'
import { ONRAMP_TRANSACTIONS_RESPONSES } from '../constants/OnrampTransactions.js'
import type { Transaction } from '@web3modal/common'

// -- Tests --------------------------------------------------------------------
describe('TransactionsController', () => {
  it('should have valid default state', () => {
    expect(TransactionsController.state).toEqual({
      transactions: [],
      transactionsByYear: {},
      loading: false,
      empty: false,
      next: undefined,
      coinbaseTransactions: {}
    })
  })

  it('should fetch onramp transactions and group them appropiately', async () => {
    const projectId = '123'
    OptionsController.state.projectId = projectId
    const { SUCCESS, FAILED } = ONRAMP_TRANSACTIONS_RESPONSES
    const accountAddress = SUCCESS.metadata.sentTo

    const response = {
      data: [SUCCESS, FAILED] as Transaction[],
      next: ''
    }

    const fetchTransactions = vi
      .spyOn(BlockchainApiController, 'fetchTransactions')
      .mockResolvedValue(response)

    await TransactionsController.fetchTransactions(accountAddress, 'coinbase')

    expect(fetchTransactions).toHaveBeenCalledWith({
      account: accountAddress,
      projectId,
      onramp: 'coinbase',
      cursor: undefined
    })

    // Success is newer than failed
    expect(TransactionsController.state.coinbaseTransactions).toEqual({
      2024: {
        1: [SUCCESS, FAILED]
      }
    })
  })
})
