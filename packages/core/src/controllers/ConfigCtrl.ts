import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { ConfigOptions } from '../../types/configTypes'

// -- types -------------------------------------------------------- //
export interface State extends ConfigOptions {
  configured: boolean
}

// -- initial state ------------------------------------------------ //
const state = proxy<State>({
  configured: false,
  projectId: '',
  theme: 'light',
  accentColor: 'default',
  ethereumClient: undefined
})

// -- controller --------------------------------------------------- //
export const ConfigCtrl = {
  state,

  subscribe(callback: (newState: State) => void) {
    return valtioSub(state, () => callback(state))
  },

  setConfig(config: ConfigOptions) {
    Object.assign(state, config)
    state.configured = true
  }
}
