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
}

const state = proxy<ThemeStoreState>({
  mixColorStrength: 0,
  mixColor: undefined,
  accentColor: undefined,
  borderRadius: '4px',
  themeVariables: {}
})

export const ThemeStore = {
  state,

  setMixColorStrength(value: ThemeStoreState['mixColorStrength']) {
    state.mixColorStrength = value
  },

  setMixColor(value: ThemeStoreState['mixColor']) {
    state.mixColor = value
  },

  setAccentColor(value: ThemeStoreState['accentColor']) {
    state.accentColor = value
  },

  setBorderRadius(value: ThemeStoreState['borderRadius']) {
    state.borderRadius = value
  },

  setThemeVariables(value: ThemeStoreState['themeVariables']) {
    state.themeVariables = value
  }
}
