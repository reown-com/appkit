import { proxy } from 'valtio'

interface ThemeVariables {
  '--w3m-font-family'?: string
  '--w3m-accent'?: string
  '--w3m-color-mix'?: string
  '--w3m-color-mix-strength'?: number
  '--w3m-font-size-master'?: string
  '--w3m-border-radius-master'?: string
  '--w3m-z-index'?: number
}

interface ThemeState {
  mixColorStrength: number
  mixColor: string
  accentColor: string
  borderRadius: string
  themeVariables: ThemeVariables
  modal?: any
}

export const state = proxy<ThemeState>({
  mixColorStrength: 0,
  mixColor: '#FFFFFF',
  accentColor: '#3B82F6',
  borderRadius: '12px',
  themeVariables: {},
  modal: undefined
})

export const ThemeStore = {
  state,

  setMixColorStrength(value: ThemeState['mixColorStrength']) {
    state.mixColorStrength = value
    if (state.modal) {
      state.modal.setThemeVariables({ '--w3m-color-mix-strength': value })
    }
  },

  setMixColor(value: ThemeState['mixColor']) {
    state.mixColor = value
    if (state.modal) {
      state.modal.setThemeVariables({ '--w3m-color-mix': value })
    }
  },

  setAccentColor(value: ThemeState['accentColor']) {
    state.accentColor = value
    if (state.modal) {
      state.modal.setThemeVariables({ '--w3m-accent': value })
    }
  },

  setBorderRadius(value: number) {
    const radiusString = `${value}px`
    state.borderRadius = radiusString
    if (state.modal) {
      state.modal.setThemeVariables({ '--w3m-border-radius-master': radiusString })
    }
  },

  setThemeVariables(value: ThemeState['themeVariables']) {
    state.themeVariables = value
    if (state.modal) {
      state.modal.setThemeVariables(value)
    }
  },

  setModal(value: ThemeState['modal']) {
    state.modal = value
  }
}
