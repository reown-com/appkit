import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy, snapshot } from 'valtio/vanilla'
import type { AuthConnector, Connector } from '../utils/TypeUtil.js'
import { ConstantsUtil, getW3mThemeVariables } from '@web3modal/common'
import { OptionsController } from './OptionsController.js'
import { ThemeController } from './ThemeController.js'

// -- Types --------------------------------------------- //
interface ConnectorWithProviders extends Connector {
  providers?: Connector[]
}
export interface ConnectorControllerState {
  unMergedConnectors: Connector[]
  connectors: ConnectorWithProviders[]
}

type StateKey = keyof ConnectorControllerState

// -- State --------------------------------------------- //
const state = proxy<ConnectorControllerState>({
  unMergedConnectors: [],
  connectors: []
})

// -- Controller ---------------------------------------- //
export const ConnectorController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: ConnectorControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  setConnectors(connectors: ConnectorControllerState['connectors']) {
    connectors.forEach(this.syncIfAuthConnector)
    state.unMergedConnectors = [...state.unMergedConnectors, ...connectors].filter(connector => {
      /**
       * This is a fix for non-serializable objects that may prevent all the connectors in the list from being displayed
       * Check more about this issue on https://valtio.dev/docs/api/basic/proxy#Gotchas
       */
      try {
        const canProxyConnector = Boolean(proxy(connector))

        if (!canProxyConnector) {
          throw new Error('Connector is not available')
        }

        return true
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('ConnectorController.setConnectors: Not possible to add connector', {
          connector,
          error
        })

        return false
      }
    })
    state.connectors = this.mergeMultiChainConnectors(state.unMergedConnectors)
  },

  mergeMultiChainConnectors(connectors: Connector[]) {
    const connectorsByNameMap = this.generateConnectorMapByName(connectors)

    const refactoredConnectors = Array.from(connectorsByNameMap.values()).map(_connectors => {
      if (_connectors.length > 1) {
        return {
          name: _connectors[0]?.name,
          imageUrl: _connectors[0]?.imageUrl,
          imageId: _connectors[0]?.imageId,
          providers: this.getUniqueConnectorsByName(_connectors),
          type: 'MULTI_CHAIN'
        } as ConnectorWithProviders
      }

      return _connectors[0] as ConnectorWithProviders
    })

    return refactoredConnectors
  },

  generateConnectorMapByName(connectors: Connector[]): Map<string, Connector[]> {
    const connectorsByNameMap = new Map<string, Connector[]>()

    connectors.forEach(connector => {
      const { name } = connector

      if (!name) {
        return
      }

      const connectorsByName = connectorsByNameMap.get(name) || []
      const haveSameConnector = connectorsByName.find(c => c.chain === connector.chain)
      if (!haveSameConnector) {
        connectorsByName.push(connector)
      }
      connectorsByNameMap.set(name, connectorsByName)
    })

    return connectorsByNameMap
  },

  getUniqueConnectorsByName(connectors: Connector[]) {
    const uniqueConnectors: Connector[] = []

    connectors.forEach(c => {
      if (!uniqueConnectors.find(uc => uc.chain === c.chain)) {
        uniqueConnectors.push({
          ...c,
          name: ConstantsUtil.CHAIN_NAME_MAP[c.chain]
        })
      }
    })

    return uniqueConnectors
  },

  addConnector(connector: Connector | AuthConnector) {
    this.setConnectors([connector])
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
      projectId: optionsState.projectId
    })
    authConnector.provider.syncTheme({
      themeMode,
      themeVariables,
      w3mThemeVariables: getW3mThemeVariables(themeVariables, themeMode)
    })
  }
}
