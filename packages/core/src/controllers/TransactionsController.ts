import { proxy, subscribe as sub } from 'valtio/vanilla'

// -- Types --------------------------------------------- //
export interface TransactionsControllerState {
 transactions: any[]
 loading: boolean
 empty: boolean
}

// -- State --------------------------------------------- //
const state = proxy<TransactionsControllerState>({
  transactions: [],
  loading: false,
  empty: false
})

type StateKey = keyof TransactionsControllerState

// -- Controller ---------------------------------------- //
export const TransactionsController = {
  state,

  subscribe(callback: (newState: TransactionsControllerState) => void) {
    return sub(state, () => callback(state))
  },

  fetchTransactions(){
    state.loading = true
    setTimeout(() => {
      state.loading = false
      state.transactions = []
      state.empty = true
    }, 1000)
  }
}
