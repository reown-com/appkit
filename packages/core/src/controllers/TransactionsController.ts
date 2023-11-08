import { proxy, subscribe as sub } from 'valtio/vanilla'
import { BlockchainApiController } from './BlockchainApiController.js'
import { OptionsController } from './OptionsController.js'
import { AccountController } from './AccountController.js'
import type { Transaction } from '../utils/TypeUtil.js'
import { DateUtil } from '@web3modal/utils'

// -- Types --------------------------------------------- //
type TransactionByYearMap = Record<number, Transaction[]>

export interface TransactionsControllerState {
  transactions: Transaction[]
  transactionsByYear: TransactionByYearMap
  loading: boolean
  empty: boolean
  next: string | null
}

// -- State --------------------------------------------- //
const state = proxy<TransactionsControllerState>({
  transactions: [],
  transactionsByYear: {},
  loading: false,
  empty: false,
  next: null
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
    await BlockchainApiController.fetchTransactions({
      account: accountAddress,
      projectId,
      cursor: state.next
    })
      .then(response => {
        state.loading = false

        const nonSpamTransactions = this.filterSpamTransactions(response.data)

        state.transactions = [...state.transactions, ...nonSpamTransactions]
        state.transactionsByYear = this.groupTransactionsByYear(
          state.transactionsByYear,
          nonSpamTransactions
        )
        state.empty = response.data.length === 0
        state.next = response.next
      })
      .catch(() => {
        state.loading = false
        state.empty = true
      })
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
