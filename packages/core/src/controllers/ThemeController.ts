import { proxy, subscribe as sub, snapshot } from 'valtio/vanilla'
import type { ThemeMode, ThemeVariables } from '../utils/TypeUtil.js'

// -- Types --------------------------------------------- //
export interface ThemeControllerState {
  themeMode: ThemeMode
  themeVariables: ThemeVariables
}

// -- State --------------------------------------------- //
const state = proxy<ThemeControllerState>({
  themeMode: 'dark',
  themeVariables: {}
})

// -- Controller ---------------------------------------- //
export const ThemeController = {
  state,

  subscribe(callback: (newState: ThemeControllerState) => void) {
    return sub(state, () => callback(state))
  },

  setThemeMode(themeMode: ThemeControllerState['themeMode']) {
    state.themeMode = themeMode
  },

  setThemeVariables(themeVariables: ThemeControllerState['themeVariables']) {
    state.themeVariables = { ...state.themeVariables, ...themeVariables }
  },

  getSnapshot() {
    return snapshot(state)
  }
}
