import { subscribeKey as subKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'
import type { Connector, ConnectorType } from '../utils/TypeUtils.js'

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
    state.connectors = connectors
  },

  addConnector(connector: Connector) {
    state.connectors.push(connector)
  },

  removeConnectorByType(type: ConnectorType) {
    state.connectors = state.connectors.filter(c => c.type !== type)
  }
}
