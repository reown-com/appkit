import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy, snapshot } from 'valtio/vanilla'
import type { AuthConnector, Connector } from '../utils/TypeUtil.js'
import { getW3mThemeVariables } from '@reown/appkit-common'
import { OptionsController } from './OptionsController.js'
import { ThemeController } from './ThemeController.js'

// -- Types --------------------------------------------- //
interface ConnectorWithProviders extends Connector {
  connectors?: Connector[]
}
export interface ConnectorControllerState {
  allConnectors: Connector[]
  connectors: ConnectorWithProviders[]
}

type StateKey = keyof ConnectorControllerState

// -- State --------------------------------------------- //
const state = proxy<ConnectorControllerState>({
  allConnectors: [],
  connectors: []
})

// -- Controller ---------------------------------------- //
export const ConnectorController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: ConnectorControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  setConnectors(connectors: ConnectorControllerState['connectors']) {
    const newConnectors = connectors.filter(
      newConnector =>
        !state.allConnectors.some(
          existingConnector =>
            existingConnector.id === newConnector.id &&
            this.getConnectorName(existingConnector.name) ===
              this.getConnectorName(newConnector.name) &&
            existingConnector.chain === newConnector.chain
        )
    )

    state.allConnectors = [...state.connectors, ...newConnectors]
    state.connectors = this.mergeMultiChainConnectors(state.allConnectors)
  },

  mergeMultiChainConnectors(connectors: Connector[]) {
    const connectorsByNameMap = this.generateConnectorMapByName(connectors)

    const mergedConnectors: ConnectorWithProviders[] = []

    connectorsByNameMap.forEach(keyConnectors => {
      const firstItem = keyConnectors[0]

      if (keyConnectors.length > 1) {
        mergedConnectors.push({
          name: firstItem?.name,
          imageUrl: firstItem?.imageUrl,
          imageId: firstItem?.imageId,
          connectors: [...keyConnectors],
          type: 'MULTI_CHAIN',
          // These values are just placeholders, we don't use them in multi-chain connector select screen
          chain: 'eip155',
          id: firstItem?.id || ''
        })
      } else if (firstItem) {
        mergedConnectors.push(firstItem)
      }
    })

    return mergedConnectors
  },

  generateConnectorMapByName(connectors: Connector[]): Map<string, Connector[]> {
    const connectorsByNameMap = new Map<string, Connector[]>()

    connectors.forEach(connector => {
      const { name } = connector
      const connectorName = this.getConnectorName(name)

      if (!connectorName) {
        return
      }

      const connectorsByName = connectorsByNameMap.get(connectorName) || []
      const haveSameConnector = connectorsByName.find(c => c.chain === connector.chain)
      if (!haveSameConnector) {
        connectorsByName.push(connector)
      }
      connectorsByNameMap.set(connectorName, connectorsByName)
    })

    return connectorsByNameMap
  },

  getConnectorName(name: string | undefined) {
    if (!name) {
      return name
    }

    const nameOverrideMap = {
      'Trust Wallet': 'Trust'
    }

    return (nameOverrideMap as Record<string, string>)[name] || name
  },

  getUniqueConnectorsByName(connectors: Connector[]) {
    const uniqueConnectors: Connector[] = []

    connectors.forEach(c => {
      if (!uniqueConnectors.find(uc => uc.chain === c.chain)) {
        uniqueConnectors.push(c)
      }
    })

    return uniqueConnectors
  },

  addConnector(connector: Connector | AuthConnector) {
    if (connector.id === 'w3mAuth') {
      const authConnector = connector as AuthConnector

      const optionsState = snapshot(OptionsController.state) as typeof OptionsController.state
      const themeMode = ThemeController.getSnapshot().themeMode
      const themeVariables = ThemeController.getSnapshot().themeVariables

      authConnector?.provider?.syncDappData?.({
        metadata: optionsState.metadata,
        sdkVersion: optionsState.sdkVersion,
        projectId: optionsState.projectId,
        sdkType: optionsState.sdkType
      })
      authConnector.provider.syncTheme({
        themeMode,
        themeVariables,
        w3mThemeVariables: getW3mThemeVariables(themeVariables, themeMode)
      })
      this.setConnectors([connector])
    } else {
      this.setConnectors([connector])
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
  },

  syncIfAuthConnector(connector: Connector | AuthConnector) {
    if (connector.id !== 'w3mAuth') {
      return
    }

    const authConnector = connector as AuthConnector

    const optionsState = snapshot(OptionsController.state) as typeof OptionsController.state
    const themeMode = ThemeController.getSnapshot().themeMode
    const themeVariables = ThemeController.getSnapshot().themeVariables

    authConnector?.provider?.syncDappData?.({
      metadata: optionsState.metadata,
      sdkVersion: optionsState.sdkVersion,
      sdkType: optionsState.sdkType,
      projectId: optionsState.projectId
    })
    authConnector.provider.syncTheme({
      themeMode,
      themeVariables,
      w3mThemeVariables: getW3mThemeVariables(themeVariables, themeMode)
    })
  }
}
