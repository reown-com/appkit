import { proxy, subscribe as sub } from 'valtio/vanilla'

// -- Types --------------------------------------------- //
export interface WalletButtonControllerState {
  error?: string
  loading: boolean
}

// -- State --------------------------------------------- //
const state = proxy<WalletButtonControllerState>({
  loading: false
})

// -- Controller ---------------------------------------- //
export const WalletButtonController = {
  state,

  subscribe(callback: (newState: WalletButtonControllerState) => void) {
    return sub(state, () => callback(state))
  },

  setLoading(loading: boolean) {
    state.loading = loading
  },
  
}
