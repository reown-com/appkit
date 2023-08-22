import { proxy, subscribe as sub } from 'valtio/vanilla'
import type { ThemeMode, ThemeVariables } from '../utils/TypeUtils.js'

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

  setThemeMode(themeMode: ThemeMode) {
    state.themeMode = themeMode
  },

  setThemeVariables(themeVariables: ThemeVariables) {
    state.themeVariables = { ...state.themeVariables, ...themeVariables }
  }
}
