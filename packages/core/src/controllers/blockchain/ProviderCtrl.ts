import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { ProviderCtrlState } from '../../../types/providerTypes'
import { ClientCtrl } from './ClientCtrl'

const state = proxy<ProviderCtrlState>({} as ProviderCtrlState)

// -- controller --------------------------------------------------- //
export const ProviderCtrl = {
  state,

  subscribe(callback: (newState: ProviderCtrlState) => void) {
    return valtioSub(state, () => callback(state))
  },

  watch() {
    const unwatch = ClientCtrl.ethereum().watchProvider({}, provider =>
      Object.assign(state, provider)
    )

    return unwatch
  },

  get() {
    Object.assign(state, ClientCtrl.ethereum().getProvider({}))
  }
}
