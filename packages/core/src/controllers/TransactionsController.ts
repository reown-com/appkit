import { proxy, subscribe as sub } from 'valtio/vanilla'
// import response from './response.json'
import { BlockchainApiController } from './BlockchainApiController'

// -- Types --------------------------------------------- //
export interface TransactionsControllerState {
  transactions: any[]
  loading: boolean
  empty: boolean
  next: string
}

// -- State --------------------------------------------- //
const state = proxy<TransactionsControllerState>({
  transactions: [],
  loading: false,
  empty: false,
  next: ''
})

// -- Controller ---------------------------------------- //
export const TransactionsController = {
  state,

  subscribe(callback: (newState: TransactionsControllerState) => void) {
    return sub(state, () => callback(state))
  },

  async fetchTransactions() {
    state.loading = true
    // todo(enes): get account and project id dynamically
    await BlockchainApiController.fetchTransactions({
      account: '0xf5B035287c1465F29C7e08FbB5c3b8a4975Bf831',
      projectId: 'c6f78092df3710d5a3008ed92eb8b170',
      cursor: state.next
    })
      .then(response => {
        state.loading = false
        state.transactions = [...state.transactions, ...response.data]
        state.empty = response.data.length === 0
        state.next = response.next
      })
      .catch(error => {
        state.loading = false
        state.empty = true
        console.log(error)
      })
  }
}
