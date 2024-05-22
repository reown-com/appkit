import type { Transaction } from '@web3modal/common'
import { proxy, subscribe as sub } from 'valtio/vanilla'
import {
  OptionsController,
  BlockchainApiController,
  SnackController,
  EventsController,
  type ActivityPlugin
} from '@web3modal/core'

// -- Types --------------------------------------------- //
export type ActivityController = ActivityPlugin['ActivityController']
export type ActivityControllerState = ActivityPlugin['ActivityControllerState']
type TransactionByYearMap = ActivityPlugin['TransactionByYearMap']

// -- State --------------------------------------------- //
const state = proxy<ActivityPlugin['ActivityControllerState']>({
  transactions: [],
  coinbaseTransactions: {},
  transactionsByYear: {},
  loading: false,
  empty: false,
  next: undefined,
  projectId: ''
})

// create a generic type for controller, it should have state, subscribe and initialize methods not-optional and other methods optional
export type ControllerType<T> = {
  state: T
  subscribe: (callback: (newState: T) => void) => () => void
  initialize: () => void
}

// -- Controller ---------------------------------------- //
export const ActivityController: ActivityController = {
  state,

  subscribe(callback: (newState: ActivityControllerState) => void) {
    return sub(state, () => callback(state))
  },

  initialize() {
    OptionsController.subscribe(optionsState => {
      state.projectId = optionsState.projectId
    })
  },

  async fetchTransactions(accountAddress?: string, onramp?: 'coinbase') {
    const projectId = state.projectId

    if (!projectId || !accountAddress) {
      throw new Error("Transactions can't be fetched without a projectId and an accountAddress")
    }

    state.loading = true

    try {
      const response = await BlockchainApiController.fetchTransactions({
        account: accountAddress,
        projectId,
        cursor: state.next,
        onramp
      })

      const nonSpamTransactions = this.filterSpamTransactions(response.data)
      const filteredTransactions = [...state.transactions, ...nonSpamTransactions]

      state.loading = false

      if (onramp === 'coinbase') {
        state.coinbaseTransactions = this.groupTransactionsByYearAndMonth(
          state.coinbaseTransactions,
          response.data
        )
      } else {
        state.transactions = filteredTransactions
        state.transactionsByYear = this.groupTransactionsByYearAndMonth(
          state.transactionsByYear,
          nonSpamTransactions
        )
      }

      state.empty = filteredTransactions.length === 0
      state.next = response.next ? response.next : undefined
    } catch (error) {
      EventsController.sendEvent({
        type: 'track',
        event: 'ERROR_FETCH_TRANSACTIONS',
        properties: {
          address: accountAddress,
          projectId,
          cursor: state.next
        }
      })
      SnackController.showError('Failed to fetch transactions')
      state.loading = false
      state.empty = true
      state.next = undefined
    }
  },

  groupTransactionsByYearAndMonth(
    transactionsMap: TransactionByYearMap = {},
    transactions: Transaction[] = []
  ) {
    const grouped = transactionsMap
    transactions.forEach(transaction => {
      const year = new Date(transaction.metadata.minedAt).getFullYear()
      const month = new Date(transaction.metadata.minedAt).getMonth()

      const yearTransactions = grouped[year] ?? {}
      const monthTransactions = yearTransactions[month] ?? []

      // If there's a transaction with the same id, remove the old one
      const newMonthTransactions = monthTransactions.filter(tx => tx.id !== transaction.id)

      grouped[year] = {
        ...yearTransactions,
        [month]: [...newMonthTransactions, transaction].sort(
          (a, b) => new Date(b.metadata.minedAt).getTime() - new Date(a.metadata.minedAt).getTime()
        )
      }
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
  },

  clearCursor() {
    state.next = undefined
  },

  resetTransactions() {
    state.transactions = []
    state.transactionsByYear = {}
    state.loading = false
    state.empty = false
    state.next = undefined
  }
}
