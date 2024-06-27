import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy, ref, snapshot } from 'valtio/vanilla'
import type { AuthConnector, Connector } from '../utils/TypeUtil.js'
import { getW3mThemeVariables } from '@web3modal/common'
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

  setConnectors(connectors: ConnectorControllerState['connectors'], multiChain?: boolean) {
    if (multiChain) {
      state.connectors = [...state.connectors, ...connectors.map(c => ref(c))]

      state.connectors = this.mergeMultiChainConnectors(state.connectors)
    } else {
      state.connectors = connectors.map(c => ref(c))
    }
  },

  mergeMultiChainConnectors(connectors: ConnectorControllerState['connectors']) {
    const mergedConnectors: Connector[] = []

    connectors.forEach(connector => {
      const { name, chain, type } = connector

      const existingConnectorIndex = mergedConnectors.findIndex(
        existingConnector => existingConnector.name === name
      )

      if (existingConnectorIndex === -1) {
        mergedConnectors.push({ ...connector })
      } else {
        const existingConnector = mergedConnectors[existingConnectorIndex]
        if (existingConnector) {
          if (existingConnector?.chain === chain || existingConnector.type === type) {
            mergedConnectors.push({ ...connector })
          } else if (existingConnector.type === 'MULTI_CHAIN') {
            mergedConnectors.push({ ...connector })
          } else {
            mergedConnectors[existingConnectorIndex] = {
              ...existingConnector,
              type: 'MULTI_CHAIN',
              providers: [existingConnector, connector]
            }
          }
        }
      }
    })

    return mergedConnectors
  },

  addConnector(connector: Connector | AuthConnector) {
    state.connectors.push(ref(connector))

    if (connector.id === 'w3mAuth') {
      const authConnector = connector as AuthConnector
      const optionsState = snapshot(OptionsController.state) as typeof OptionsController.state
      const themeMode = ThemeController.getSnapshot().themeMode
      const themeVariables = ThemeController.getSnapshot().themeVariables

      authConnector?.provider?.syncDappData?.({
        metadata: optionsState.metadata,
        sdkVersion: optionsState.sdkVersion,
        projectId: optionsState.projectId
      })
      authConnector.provider.syncTheme({
        themeMode,
        themeVariables,
        w3mThemeVariables: getW3mThemeVariables(themeVariables, themeMode)
      })
    }
  },

  getAuthConnector() {
    return state.connectors.find(c => c.type === 'AUTH') as AuthConnector | undefined
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
