import { proxy, ref, snapshot, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import { type ChainNamespace, ConstantsUtil, getW3mThemeVariables } from '@reown/appkit-common'

import { MobileWalletUtil } from '../utils/MobileWallet.js'
import { StorageUtil } from '../utils/StorageUtil.js'
import type { AuthConnector, Connector, WcWallet } from '../utils/TypeUtil.js'
import { ApiController } from './ApiController.js'
import { ChainController } from './ChainController.js'
import { OptionsController } from './OptionsController.js'
import { RouterController } from './RouterController.js'
import { ThemeController } from './ThemeController.js'

// -- Types --------------------------------------------- //
export interface ConnectorWithProviders extends Connector {
  connectors?: Connector[]
}
export interface ConnectorControllerState {
  allConnectors: Connector[]
  connectors: ConnectorWithProviders[]
  activeConnector: Connector | undefined
  filterByNamespace: ChainNamespace | undefined
  activeConnectorIds: Record<ChainNamespace, string | undefined>
}

type StateKey = keyof ConnectorControllerState

const defaultActiveConnectors = {
  eip155: undefined,
  solana: undefined,
  polkadot: undefined,
  bip122: undefined
}

// -- State --------------------------------------------- //
const state = proxy<ConnectorControllerState>({
  allConnectors: [],
  connectors: [],
  activeConnector: undefined,
  filterByNamespace: undefined,
  activeConnectorIds: { ...defaultActiveConnectors }
})

// -- Controller ---------------------------------------- //
export const ConnectorController = {
  state,

  subscribe(callback: (value: ConnectorControllerState) => void) {
    return sub(state, () => {
      callback(state)
    })
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: ConnectorControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  initialize(namespaces: ChainNamespace[]) {
    namespaces.forEach(namespace => {
      const connectorId = StorageUtil.getConnectedConnectorId(namespace)
      if (connectorId) {
        this.setConnectorId(connectorId, namespace)
      }
    })
  },

  setActiveConnector(connector: ConnectorControllerState['activeConnector']) {
    if (connector) {
      state.activeConnector = ref(connector)
    }
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

    /**
     * We are reassigning the state of the proxy to a new array of new objects, this can cause issues. So it is better to use ref in this case.
     * Check more about proxy on https://valtio.dev/docs/api/basic/proxy#Gotchas
     * Check more about ref on https://valtio.dev/docs/api/basic/ref
     */
    newConnectors.forEach(connector => {
      if (connector.type !== 'MULTI_CHAIN') {
        state.allConnectors.push(ref(connector))
      }
    })

    state.connectors = this.mergeMultiChainConnectors(state.allConnectors)
  },

  removeAdapter(namespace: ChainNamespace) {
    state.allConnectors = state.allConnectors.filter(connector => connector.chain !== namespace)
    state.connectors = this.mergeMultiChainConnectors(state.allConnectors)
  },

  mergeMultiChainConnectors(connectors: Connector[]) {
    const connectorsByNameMap = this.generateConnectorMapByName(connectors)

    const mergedConnectors: ConnectorWithProviders[] = []

    connectorsByNameMap.forEach(keyConnectors => {
      const firstItem = keyConnectors[0]

      const isAuthConnector = firstItem?.id === ConstantsUtil.CONNECTOR_ID.AUTH

      if (keyConnectors.length > 1 && firstItem) {
        mergedConnectors.push({
          name: firstItem.name,
          imageUrl: firstItem.imageUrl,
          imageId: firstItem.imageId,
          connectors: [...keyConnectors],
          type: isAuthConnector ? 'AUTH' : 'MULTI_CHAIN',
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
    if (connector.id === ConstantsUtil.CONNECTOR_ID.AUTH) {
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
      authConnector?.provider?.syncTheme({
        themeMode,
        themeVariables,
        w3mThemeVariables: getW3mThemeVariables(themeVariables, themeMode)
      })
      this.setConnectors([connector])
    } else {
      this.setConnectors([connector])
    }
  },

  getAuthConnector(chainNamespace?: ChainNamespace): AuthConnector | undefined {
    const activeNamespace = chainNamespace || ChainController.state.activeChain
    const authConnector = state.connectors.find(c => c.id === ConstantsUtil.CONNECTOR_ID.AUTH)

    if (!authConnector) {
      return undefined
    }

    if (authConnector?.connectors?.length) {
      const connector = authConnector.connectors.find(c => c.chain === activeNamespace)

      return connector as AuthConnector | undefined
    }

    return authConnector as AuthConnector
  },

  getAnnouncedConnectorRdns() {
    return state.connectors.filter(c => c.type === 'ANNOUNCED').map(c => c.info?.rdns)
  },

  getConnectorById(id: string) {
    return state.allConnectors.find(c => c.id === id)
  },

  getConnector(id: string, rdns?: string | null) {
    return state.allConnectors.find(c => c.explorerId === id || c.info?.rdns === rdns)
  },

  syncIfAuthConnector(connector: Connector | AuthConnector) {
    if (connector.id !== 'ID_AUTH') {
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
  },

  /**
   * Returns the connectors filtered by namespace.
   * @param namespace - The namespace to filter the connectors by.
   * @returns ConnectorWithProviders[].
   */
  getConnectorsByNamespace(namespace: ChainNamespace) {
    const namespaceConnectors = state.allConnectors.filter(
      connector => connector.chain === namespace
    )

    return this.mergeMultiChainConnectors(namespaceConnectors)
  },

  selectWalletConnector(wallet: WcWallet) {
    const connector = ConnectorController.getConnector(wallet.id, wallet.rdns)

    if (ChainController.state.activeChain === ConstantsUtil.CHAIN.SOLANA) {
      MobileWalletUtil.handleSolanaDeeplinkRedirect(connector?.name || wallet.name || '')
    }

    if (connector) {
      RouterController.push('ConnectingExternal', { connector })
    } else {
      RouterController.push('ConnectingWalletConnect', { wallet })
    }
  },

  /**
   * Returns the connectors. If a namespace is provided, the connectors are filtered by namespace.
   * @param namespace - The namespace to filter the connectors by. If not provided, all connectors are returned.
   * @returns ConnectorWithProviders[].
   */
  getConnectors(namespace?: ChainNamespace) {
    if (namespace) {
      return this.getConnectorsByNamespace(namespace)
    }

    return this.mergeMultiChainConnectors(state.allConnectors)
  },

  /**
   * Sets the filter by namespace and updates the connectors.
   * @param namespace - The namespace to filter the connectors by.
   */
  setFilterByNamespace(namespace: ChainNamespace | undefined) {
    state.filterByNamespace = namespace
    state.connectors = this.getConnectors(namespace)
    ApiController.setFilterByNamespace(namespace)
  },

  setConnectorId(connectorId: string, namespace: ChainNamespace) {
    if (connectorId) {
      state.activeConnectorIds = {
        ...state.activeConnectorIds,
        [namespace]: connectorId
      }
      StorageUtil.setConnectedConnectorId(namespace, connectorId)
    }
  },

  removeConnectorId(namespace: ChainNamespace) {
    state.activeConnectorIds = {
      ...state.activeConnectorIds,
      [namespace]: undefined
    }
    StorageUtil.deleteConnectedConnectorId(namespace)
  },

  getConnectorId(namespace: ChainNamespace | undefined) {
    if (!namespace) {
      return undefined
    }

    return state.activeConnectorIds[namespace]
  },

  isConnected(namespace?: ChainNamespace) {
    if (!namespace) {
      return Object.values(state.activeConnectorIds).some(id => Boolean(id))
    }

    return Boolean(state.activeConnectorIds[namespace])
  },

  resetConnectorIds() {
    state.activeConnectorIds = { ...defaultActiveConnectors }
  }
}
