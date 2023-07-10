import { subscribeKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'

// -- Types --------------------------------------------- //
export type ConnectorType = 'EXTERNAL' | 'INJECTED' | 'MULTI_INJECTED' | 'WALLET_CONNECT'

export interface Connector {
  id: string
  type: ConnectorType
  name?: string
  imageSrc?: string
}

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

  subscribe<K extends StateKey>(key: K, callback: (value: ConnectorControllerState[K]) => void) {
    subscribeKey(state, key, callback)
  },

  setConnectors(connectors: ConnectorControllerState['connectors']) {
    state.connectors = connectors
  },

  addConnector(connector: Connector) {
    state.connectors.push(connector)
  },

  removeConnectorById(connectorId: Connector['id']) {
    state.connectors = state.connectors.filter(c => c.id !== connectorId)
  }
}
