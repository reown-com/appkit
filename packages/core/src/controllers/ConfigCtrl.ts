import { proxy } from 'valtio/vanilla'

// -- types -------------------------------------------------------- //
export interface State {
  configured: boolean
  options: {
    projectId: string
    theme?: 'dark' | 'light'
  }
}

// -- initial state ------------------------------------------------ //
const state = proxy<State>({
  configured: false,
  options: {
    projectId: '',
    theme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
})

// -- controller --------------------------------------------------- //
export default {
  state,

  setConfig(config: Omit<State, 'configured'>) {
    Object.assign(state, config)
    state.configured = true
  }
}
