import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy, ref, snapshot } from 'valtio/vanilla'
import type { AuthConnector, Connector } from '../utils/TypeUtil.js'
import { ConstantsUtil, getW3mThemeVariables } from '@web3modal/common'
import { OptionsController } from './OptionsController.js'
import { ThemeController } from './ThemeController.js'
import { ChainController } from './ChainController.js'

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
    if (ChainController.state.multiChainEnabled) {
      state.unMergedConnectors = [...state.unMergedConnectors, ...connectors]
      state.connectors = this.mergeMultiChainConnectors(state.unMergedConnectors)
    } else {
      state.connectors = connectors.map(c => ref(c))
    }
  },

  mergeMultiChainConnectors(connectors: Connector[]) {
    const connectorMap = new Map<string, Connector[]>()

    connectors.forEach(c => {
      const { name } = c

      if (!name) {
        return
      }

      const cnctrs = connectorMap.get(name) || []
      connectorMap.set(name, [...cnctrs, c])
    })

    const newConnectors = Array.from(connectorMap.values()).map(cons => {
      if (cons.length > 1) {
        return {
          name: cons[0]?.name,
          imageUrl: cons[0]?.imageUrl,
          imageId: cons[0]?.imageId,
          providers: this.getUniqueConnectorsByName(cons),
          type: 'MULTI_CHAIN'
        } as ConnectorWithProviders
      }

      return cons[0] as ConnectorWithProviders
    })

    return newConnectors
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
