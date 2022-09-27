import type { Provider } from '@web3modal/ethereum'
import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import { ClientCtrl } from './ClientCtrl'

const state = proxy<Provider>({} as Provider)

// -- controller --------------------------------------------------- //
export const ProviderCtrl = {
  state,

  subscribe(callback: (newState: Provider) => void) {
    return valtioSub(state, () => callback(state))
  },

  watch() {
    return ClientCtrl.ethereum().watchProvider({}, provider => Object.assign(state, provider))
  },

  get() {
    Object.assign(state, ClientCtrl.ethereum().getProvider({}))
  }
}
