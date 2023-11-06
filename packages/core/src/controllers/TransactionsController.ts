import { proxy, subscribe as sub } from 'valtio/vanilla'
import { BlockchainApiController } from './BlockchainApiController.js'
import { OptionsController } from './OptionsController.js'
import { AccountController } from './AccountController.js'
import type { Transaction } from '../utils/TypeUtil.js'

// -- Types --------------------------------------------- //
export interface TransactionsControllerState {
  transactions: Transaction[]
  loading: boolean
  empty: boolean
  next: string | null
}

// -- State --------------------------------------------- //
const state = proxy<TransactionsControllerState>({
  transactions: [],
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
        state.transactions = [...state.transactions, ...response.data]
        state.empty = response.data.length === 0
        state.next = response.next
      })
      .catch(() => {
        state.loading = false
        state.empty = true
      })
  }
}
