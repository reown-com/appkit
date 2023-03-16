import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { ThemeCtrlState } from '../types/controllerTypes'

// -- initial state ------------------------------------------------ //
function isDarkMode() {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
}

const state = proxy<ThemeCtrlState>({
  themeMode: isDarkMode() ? 'dark' : 'light'
})

// -- controller --------------------------------------------------- //
export const ThemeCtrl = {
  state,

  subscribe(callback: (newState: ThemeCtrlState) => void) {
    return valtioSub(state, () => callback(state))
  },

  setThemeConfig(theme: ThemeCtrlState) {
    Object.assign(state, {
      ...theme,
      themeMode: theme.themeMode ?? (isDarkMode() ? 'dark' : 'light')
    })
  }
}
