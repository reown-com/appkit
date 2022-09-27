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

  watch(chainId?: number) {
    return ClientCtrl.ethereum().watchProvider({ chainId }, provider =>
      Object.assign(state, provider)
    )
  },

  get(chainId?: number) {
    Object.assign(state, ClientCtrl.ethereum().getProvider({ chainId }))
  }
}
