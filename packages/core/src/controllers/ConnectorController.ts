import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, ref, snapshot } from 'valtio/vanilla'
import type { Connector, EmailConnector } from '../utils/TypeUtil.js'
import { OptionsController } from './OptionsController.js'
import { ThemeController } from './ThemeController.js'

// -- Types --------------------------------------------- //
export interface ConnectorControllerState {
  connectors: Connector[]
}

type StateKey = keyof ConnectorControllerState

// -- State --------------------------------------------- //
const state = proxy<ConnectorControllerState>({
  connectors: []
})

// -- Controller ---------------------------------------- //
export const ConnectorController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: ConnectorControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  setConnectors(connectors: ConnectorControllerState['connectors']) {
    state.connectors = connectors.map(c => ref(c))
  },

  addConnector(connector: Connector) {
    state.connectors.push(ref(connector))

    if (connector.id === 'w3mEmail') {
      const emailConnector = connector as EmailConnector
      const optionsState = snapshot(OptionsController.state) as typeof OptionsController.state
      emailConnector?.provider?.syncDappData?.({
        metadata: optionsState.metadata,
        sdkVersion: optionsState.sdkVersion,
        projectId: optionsState.projectId
      })
      emailConnector.provider.syncTheme({
        themeMode: ThemeController.getSnapshot().themeMode,
        themeVariables: ThemeController.getSnapshot().themeVariables
      })
    }
  },

  getEmailConnector() {
    return state.connectors.find(c => c.type === 'EMAIL') as EmailConnector | undefined
  },

  getAnnouncedConnectorRdns() {
    return state.connectors.filter(c => c.type === 'ANNOUNCED').map(c => c.info?.rdns)
  },

  getConnectors() {
    return state.connectors
  },

  getConnector(id: string, rdns?: string | null) {
    return state.connectors.find(c => c.explorerId === id || c.info?.rdns === rdns)
  }
}
