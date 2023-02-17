import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { ThemeCtrlState } from '../types/controllerTypes'
import { CoreUtil } from '../utils/CoreUtil'

// -- initial state ------------------------------------------------ //
function isDarkMode() {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
}

const state = proxy<ThemeCtrlState>({
  themeMode: isDarkMode() ? 'dark' : 'light',
  themeColor: 'default',
  themeBackground: CoreUtil.isMobile() ? 'themeColor' : 'gradient',
  themeZIndex: 89
})

// -- controller --------------------------------------------------- //
export const ThemeCtrl = {
  state,

  subscribe(callback: (newState: ThemeCtrlState) => void) {
    return valtioSub(state, () => callback(state))
  },

  setThemeConfig(theme: ThemeCtrlState) {
    Object.assign(state, theme)
  }
}
