import { proxy, subscribe as sub, snapshot } from 'valtio/vanilla'
import type { ThemeMode, ThemeVariables } from '../utils/TypeUtil.js'
import { ConnectorController } from './ConnectorController.js'
import { getCommonThemeVariables } from '@web3modal/common'
import type { W3mThemeVariables } from '@web3modal/common'

// -- Types --------------------------------------------- //
export interface ThemeControllerState {
  themeMode: ThemeMode
  themeVariables: ThemeVariables
  w3mThemeVariables: W3mThemeVariables | undefined
}

// -- State --------------------------------------------- //
const state = proxy<ThemeControllerState>({
  themeMode: 'dark',
  themeVariables: {},
  w3mThemeVariables: undefined
})

// -- Controller ---------------------------------------- //
export const ThemeController = {
  state,

  subscribe(callback: (newState: ThemeControllerState) => void) {
    return sub(state, () => callback(state))
  },

  setThemeMode(themeMode: ThemeControllerState['themeMode']) {
    state.themeMode = themeMode
    try {
      const emailConnector = ConnectorController.getEmailConnector()

      if (emailConnector) {
        emailConnector.provider.syncTheme({
          themeMode: ThemeController.getSnapshot().themeMode,
          w3mThemeVariables: getCommonThemeVariables(
            ThemeController.getSnapshot().themeVariables,
            themeMode
          )
        })
      }
    } catch {
      // eslint-disable-next-line no-console
      console.info('Unable to sync theme to email connector')
    }
  },

  setThemeVariables(themeVariables: ThemeControllerState['themeVariables']) {
    state.themeVariables = { ...state.themeVariables, ...themeVariables }
    try {
      const emailConnector = ConnectorController.getEmailConnector()
      if (emailConnector) {
        emailConnector.provider.syncTheme({
          themeVariables: ThemeController.getSnapshot().themeVariables,
          w3mThemeVariables: getCommonThemeVariables(
            ThemeController.getSnapshot().themeVariables,
            state.themeMode
          )
        })
      }
    } catch {
      // eslint-disable-next-line no-console
      console.info('Unable to sync theme to email connector')
    }
  },

  getSnapshot() {
    return snapshot(state)
  }
}
