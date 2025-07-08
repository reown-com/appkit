import { proxy, snapshot, subscribe as sub } from 'valtio/vanilla'

import { getW3mThemeVariables } from '@reown/appkit-common'
import type { W3mThemeVariables } from '@reown/appkit-common'

import type { ThemeMode, ThemeVariables } from '../utils/TypeUtil.js'
import { withErrorBoundary } from '../utils/withErrorBoundary.js'
import { ConnectorController } from './ConnectorController.js'

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
const controller = {
  state,

  subscribe(callback: (newState: ThemeControllerState) => void) {
    return sub(state, () => callback(state))
  },

  setThemeMode(themeMode: ThemeControllerState['themeMode']) {
    state.themeMode = themeMode

    try {
      const authConnector = ConnectorController.getAuthConnector()

      if (authConnector) {
        const themeVariables = controller.getSnapshot().themeVariables

        authConnector.provider.syncTheme({
          themeMode,
          themeVariables,
          w3mThemeVariables: getW3mThemeVariables(themeVariables, themeMode)
        })
      }
    } catch {
      // eslint-disable-next-line no-console
      console.info('Unable to sync theme to auth connector')
    }
  },

  setThemeVariables(themeVariables: ThemeControllerState['themeVariables']) {
    state.themeVariables = { ...state.themeVariables, ...themeVariables }

    try {
      const authConnector = ConnectorController.getAuthConnector()

      if (authConnector) {
        const themeVariablesSnapshot = controller.getSnapshot().themeVariables

        authConnector.provider.syncTheme({
          themeVariables: themeVariablesSnapshot,
          w3mThemeVariables: getW3mThemeVariables(state.themeVariables, state.themeMode)
        })
      }
    } catch {
      // eslint-disable-next-line no-console
      console.info('Unable to sync theme to auth connector')
    }
  },

  getSnapshot() {
    return snapshot(state)
  }
}

// Export the controller wrapped with our error boundary
export const ThemeController = withErrorBoundary(controller)
