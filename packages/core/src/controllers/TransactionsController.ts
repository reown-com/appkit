import { DateUtil } from '@web3modal/common'
import type { Transaction } from '@web3modal/common'
import { proxy, subscribe as sub } from 'valtio/vanilla'
import { BlockchainApiController } from './BlockchainApiController.js'
import { OptionsController } from './OptionsController.js'
import { AccountController } from './AccountController.js'
import { EventsController } from './EventsController.js'
import { SnackController } from './SnackController.js'

// -- Types --------------------------------------------- //
type TransactionByYearMap = Record<number, Transaction[]>

export interface TransactionsControllerState {
  transactions: Transaction[]
  transactionsByYear: TransactionByYearMap
  loading: boolean
  empty: boolean
  next?: string
}

// -- State --------------------------------------------- //
const state = proxy<TransactionsControllerState>({
  transactions: [],
  transactionsByYear: {},
  loading: false,
  empty: false,
  next: undefined
})

// -- Controller ---------------------------------------- //
export const TransactionsController = {
  state,

  subscribe(callback: (newState: TransactionsControllerState) => void) {
    return sub(state, () => callback(state))
  },

  async fetchTransactions() {
    const projectId = OptionsController.state.projectId
    const accountAddress = AccountController.state.address

    if (!projectId || !accountAddress) {
      throw new Error("Transactions can't be fetched without a projectId and an accountAddress")
    }

    state.loading = true

    try {
      await BlockchainApiController.fetchTransactions({
        account: accountAddress,
        projectId,
        cursor: state.next
      }).then(response => {
        state.loading = false

        const nonSpamTransactions = this.filterSpamTransactions(response.data)

        state.transactions = [...state.transactions, ...nonSpamTransactions]
        state.transactionsByYear = this.groupTransactionsByYear(
          state.transactionsByYear,
          nonSpamTransactions
        )
        state.empty = response.data.length === 0
        state.next = response.next ? response.next : undefined
      })
    } catch (error) {
      EventsController.sendEvent({ type: 'track', event: 'ERROR_FETCH_TRANSACTIONS' })
      SnackController.showError('Failed to fetch transactions')
      state.loading = false
      state.empty = true
    }
  },

  groupTransactionsByYear(
    transactionsMap: TransactionByYearMap = {},
    transactions: Transaction[] = []
  ) {
    const grouped: TransactionByYearMap = transactionsMap

    transactions.forEach(transaction => {
      const year = DateUtil.getYear(transaction.metadata.minedAt)
      if (!grouped[year]) {
        grouped[year] = []
      }
      grouped[year]?.push(transaction)
    })

    return grouped
  },

  filterSpamTransactions(transactions: Transaction[]) {
    return transactions.filter(transaction => {
      const isAllSpam = transaction.transfers.every(
        transfer => transfer.nft_info?.flags.is_spam === true
      )

      return !isAllSpam
    })
  }
}
