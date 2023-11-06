import { proxy, subscribe as sub } from 'valtio/vanilla'
// import response from './response.json'
import { BlockchainApiController } from './BlockchainApiController'
import { OptionsController } from './OptionsController'
import { AccountController } from './AccountController'

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
  const projectId = OptionsController.state.projectId
  const accountAddress = AccountController.state.address

  // todo(enes): handle empty account address
    if(!accountAddress || !projectId) return
    
    state.loading = true
    await BlockchainApiController.fetchTransactions({
      account: accountAddress,
      projectId: projectId,
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
