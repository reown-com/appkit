import { proxy } from 'valtio'

interface ThemeVariables {
  '--w3m-font-family'?: string
  '--w3m-accent'?: string
  '--w3m-color-mix'?: string
  '--w3m-color-mix-strength'?: number
  '--w3m-font-size-master'?: string
  '--w3m-border-radius-master'?: string
  '--w3m-z-index'?: string
}
interface ThemeStoreState {
  mixColorStrength: number
  mixColor?: string
  accentColor?: string
  themeVariables: ThemeVariables
}

const state = proxy<ThemeStoreState>({
  mixColorStrength: 0,
  mixColor: undefined,
  accentColor: undefined,
  themeVariables: {}
})

export const themeController = {
  state,

  setMixColorStrength(value: number) {
    state.mixColorStrength = value
  },

  setMixColor(value: string) {
    state.mixColor = value
  },

  setAccentColor(value: string) {
    state.accentColor = value
  },

  setThemeVariables(value: ThemeVariables) {
    state.themeVariables = value
  }
}
