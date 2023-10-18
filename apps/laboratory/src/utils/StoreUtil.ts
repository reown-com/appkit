import { proxy } from 'valtio/vanilla'

interface ThemeVariables {
  '--w3m-font-family'?: string
  '--w3m-accent'?: string
  '--w3m-color-mix'?: string
  '--w3m-color-mix-strength'?: number
  '--w3m-font-size-master'?: string
  '--w3m-border-radius-master'?: string
  '--w3m-z-index'?: number
}
interface ThemeStoreState {
  mixColorStrength: number
  mixColor?: string
  accentColor?: string
  borderRadius: string
  themeVariables: ThemeVariables
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modal?: any
}

const state = proxy<ThemeStoreState>({
  mixColorStrength: 0,
  mixColor: undefined,
  accentColor: undefined,
  borderRadius: '4px',
  themeVariables: {},
  modal: undefined
})

export const ThemeStore = {
  state,

  setMixColorStrength(value: ThemeStoreState['mixColorStrength']) {
    state.mixColorStrength = value
    if (state.modal) {
      state.modal.setThemeVariables({ '--w3m-color-mix-strength': value })
    }
  },

  setMixColor(value: ThemeStoreState['mixColor']) {
    state.mixColor = value
    if (state.modal) {
      state.modal.setThemeVariables({ '--w3m-color-mix': value })
    }
  },

  setAccentColor(value: ThemeStoreState['accentColor']) {
    state.accentColor = value
    if (state.modal) {
      state.modal.setThemeVariables({ '--w3m-accent': value })
    }
  },

  setBorderRadius(value: ThemeStoreState['borderRadius']) {
    state.borderRadius = value
    if (state.modal) {
      state.modal.setThemeVariables({ '--w3m-border-radius-master': value })
    }
  },

  setThemeVariables(value: ThemeStoreState['themeVariables']) {
    state.themeVariables = value
    if (state.modal) {
      state.modal.setThemeVariables(value)
    }
  },

  setModal(value: ThemeStoreState['modal']) {
    state.modal = value
  }
}
