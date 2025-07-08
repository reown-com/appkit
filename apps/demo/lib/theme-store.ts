import { proxy } from 'valtio/vanilla'

import { AppKit } from '@reown/appkit'
import { type ThemeVariables } from '@reown/appkit-controllers'

import { inter } from '@/lib/fonts'
import { urlStateUtils } from '@/lib/url-state'

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
  fontFamily: inter.style.fontFamily
})

export const ThemeStore = {
  state,

  initializeThemeVariables(value: ThemeState['themeVariables']) {
    state.mixColorStrength = value['--w3m-color-mix-strength'] || 0
    state.mixColor = value['--w3m-color-mix'] || ''
    state.accentColor = value['--w3m-accent'] || ''
    state.borderRadius = value['--w3m-border-radius-master'] || '2px'
    state.fontFamily = value['--w3m-font-family'] || inter.style.fontFamily
    state.themeVariables = value
  },

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
