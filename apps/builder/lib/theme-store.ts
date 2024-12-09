import { urlStateUtils } from '@/lib/url-state'
import { AppKit } from '@reown/appkit'
import { ThemeVariables } from '@reown/appkit-core'
import { proxy } from 'valtio/vanilla'

interface ThemeState {
  mixColorStrength: number
  mixColor: string
  accentColor: string
  borderRadius: string
  themeVariables: ThemeVariables
  modal: AppKit | undefined
  fontFamily: string | undefined
}

export const state = proxy<ThemeState>({
  mixColorStrength: 0,
  mixColor: '',
  accentColor: '',
  borderRadius: '2px',
  themeVariables: {},
  modal: undefined,
  fontFamily: ''
})

export const ThemeStore = {
  state,

  setMixColorStrength(value: ThemeState['mixColorStrength']) {
    state.mixColorStrength = value
    if (state.modal) {
      state.modal.setThemeVariables({ '--w3m-color-mix-strength': value })
      urlStateUtils.updateURLWithState({ themeVariables: { '--w3m-color-mix-strength': value } })
    }
  },

  setMixColor(value: ThemeState['mixColor']) {
    state.mixColor = value
    if (state.modal) {
      state.modal.setThemeVariables({ '--w3m-color-mix': value })
      urlStateUtils.updateURLWithState({ themeVariables: { '--w3m-color-mix': value } })
    }
  },

  setAccentColor(value: ThemeState['accentColor']) {
    state.accentColor = value
    if (state.modal) {
      state.modal.setThemeVariables({ '--w3m-accent': value })
      urlStateUtils.updateURLWithState({ themeVariables: { '--w3m-accent': value } })
    }
  },

  setBorderRadius(value: string) {
    state.borderRadius = value
    if (state.modal) {
      state.modal.setThemeVariables({ '--w3m-border-radius-master': value })
      urlStateUtils.updateURLWithState({ themeVariables: { '--w3m-border-radius-master': value } })
    }
  },

  setThemeVariables(value: ThemeState['themeVariables']) {
    state.themeVariables = value
    if (state.modal) {
      state.modal.setThemeVariables(value)
      urlStateUtils.updateURLWithState({ themeVariables: value })
    }
  },

  setFontFamily(value: ThemeState['fontFamily']) {
    state.fontFamily = value
    if (state.modal) {
      state.modal.setThemeVariables({ '--w3m-font-family': value })
      urlStateUtils.updateURLWithState({ themeVariables: { '--w3m-font-family': value } })
    }
  },

  setModal(value: ThemeState['modal']) {
    state.modal = value
  }
}
