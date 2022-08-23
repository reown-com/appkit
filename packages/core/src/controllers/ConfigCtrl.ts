import { proxy, subscribe as valtioSub } from 'valtio/vanilla'

// -- types -------------------------------------------------------- //
export interface ConfigType {
  projectId: string
  theme?: 'dark' | 'light'
  accentColor?:
    | 'blackWhite'
    | 'blue'
    | 'default'
    | 'green'
    | 'magenta'
    | 'orange'
    | 'purple'
    | 'teal'
}

export interface State extends ConfigType {
  configured: boolean
}

// -- initial state ------------------------------------------------ //
const state = proxy<State>({
  configured: false,
  projectId: '',
  theme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  accentColor: 'default'
})

// -- controller --------------------------------------------------- //
export const ConfigCtrl = {
  state,

  subscribe(callback: (newState: State) => void) {
    return valtioSub(state, () => callback(state))
  },

  setConfig(config: ConfigType) {
    Object.assign(state, config)
    state.configured = true
  }
}
