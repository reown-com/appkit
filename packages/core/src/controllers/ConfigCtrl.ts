import { proxy, subscribe as valtioSub } from 'valtio/vanilla'

// -- types -------------------------------------------------------- //
export interface Config {
  projectId: string
  theme?: 'dark' | 'light'
}

export interface State extends Config {
  configured: boolean
}

// -- initial state ------------------------------------------------ //
const state = proxy<State>({
  configured: false,
  projectId: '',
  theme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
})

// -- controller --------------------------------------------------- //
export const ConfigCtrl = {
  state,

  subscribe(callback: (newState: State) => void) {
    return valtioSub(state, () => callback(state))
  },

  setConfig(config: Config) {
    Object.assign(state, config)
    state.configured = true
  }
}
