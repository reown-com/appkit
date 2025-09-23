import { proxy, ref, snapshot, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import {
  AVAILABLE_NAMESPACES,
  type ChainNamespace,
  ConstantsUtil,
  getW3mThemeVariables
} from '@reown/appkit-common'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import { getPreferredAccountType } from '../utils/ChainControllerUtil.js'
import { MobileWalletUtil } from '../utils/MobileWallet.js'
import { StorageUtil } from '../utils/StorageUtil.js'
import type { AuthConnector, Connector, WcWallet } from '../utils/TypeUtil.js'
import { withErrorBoundary } from '../utils/withErrorBoundary.js'
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
  filterByNamespaceMap: Record<ChainNamespace, boolean>
  activeConnectorIds: Record<ChainNamespace, string | undefined>
}

type StateKey = keyof ConnectorControllerState

const defaultActiveConnectors = Object.fromEntries(
  AVAILABLE_NAMESPACES.map(namespace => [namespace, undefined])
) as Record<ChainNamespace, string | undefined>

const defaultFilterByNamespaceMap = Object.fromEntries(
  AVAILABLE_NAMESPACES.map(namespace => [namespace, true])
) as Record<ChainNamespace, boolean>

// -- State --------------------------------------------- //
const state = proxy<ConnectorControllerState>({
  allConnectors: [],
  connectors: [],
  activeConnector: undefined,
  filterByNamespace: undefined,
  activeConnectorIds: defaultActiveConnectors,
  filterByNamespaceMap: defaultFilterByNamespaceMap
})

// -- Controller ---------------------------------------- //
const controller = {
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
        ConnectorController.setConnectorId(connectorId, namespace)
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
            ConnectorController.getConnectorName(existingConnector.name) ===
              ConnectorController.getConnectorName(newConnector.name) &&
            existingConnector.chain === newConnector.chain
        )
    )

    /**
     * We are reassigning the state of the proxy to a new array of new objects, ConnectorController can cause issues. So it is better to use ref in ConnectorController case.
     * Check more about proxy on https://valtio.dev/docs/api/basic/proxy#Gotchas
     * Check more about ref on https://valtio.dev/docs/api/basic/ref
     */
    newConnectors.forEach(connector => {
      if (connector.type !== 'MULTI_CHAIN') {
        state.allConnectors.push(ref(connector))
      }
    })

    const enabledNamespaces = ConnectorController.getEnabledNamespaces()
    const connectorsFilteredByNamespaces =
      ConnectorController.getEnabledConnectors(enabledNamespaces)

    state.connectors = ConnectorController.mergeMultiChainConnectors(connectorsFilteredByNamespaces)
  },

  filterByNamespaces(enabledNamespaces: ChainNamespace[]) {
    Object.keys(state.filterByNamespaceMap).forEach(namespace => {
      state.filterByNamespaceMap[namespace as ChainNamespace] = false
    })

    enabledNamespaces.forEach(namespace => {
      state.filterByNamespaceMap[namespace] = true
    })

    ConnectorController.updateConnectorsForEnabledNamespaces()
  },

  filterByNamespace(namespace: ChainNamespace, enabled: boolean) {
    state.filterByNamespaceMap[namespace] = enabled

    ConnectorController.updateConnectorsForEnabledNamespaces()
  },

  updateConnectorsForEnabledNamespaces() {
    const enabledNamespaces = ConnectorController.getEnabledNamespaces()
    const enabledConnectors = ConnectorController.getEnabledConnectors(enabledNamespaces)
    const areAllNamespacesEnabled = ConnectorController.areAllNamespacesEnabled()

    state.connectors = ConnectorController.mergeMultiChainConnectors(enabledConnectors)

    if (areAllNamespacesEnabled) {
      ApiController.clearFilterByNamespaces()
    } else {
      ApiController.filterByNamespaces(enabledNamespaces)
    }
  },

  getEnabledNamespaces(): ChainNamespace[] {
    return Object.entries(state.filterByNamespaceMap)
      .filter(([_, enabled]) => enabled)
      .map(([namespace]) => namespace as ChainNamespace)
  },

  getEnabledConnectors(enabledNamespaces: ChainNamespace[]): Connector[] {
    return state.allConnectors.filter(connector => enabledNamespaces.includes(connector.chain))
  },

  areAllNamespacesEnabled(): boolean {
    return Object.values(state.filterByNamespaceMap).every(enabled => enabled)
  },

  mergeMultiChainConnectors(connectors: Connector[]) {
    const connectorsByNameMap = ConnectorController.generateConnectorMapByName(connectors)
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
      const connectorName = ConnectorController.getConnectorName(name)

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
      ConnectorController.setConnectors([connector])
    } else {
      ConnectorController.setConnectors([connector])
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

  getConnector({
    id,
    rdns,
    namespace
  }: {
    id?: string
    rdns?: string | null
    namespace?: ChainNamespace
  }) {
    const namespaceToUse = namespace || ChainController.state.activeChain

    const connectorsByNamespace = state.allConnectors.filter(c => c.chain === namespaceToUse)

    return connectorsByNamespace.find(c => c.explorerId === id || c.info?.rdns === rdns)
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

    return ConnectorController.mergeMultiChainConnectors(namespaceConnectors)
  },

  canSwitchToSmartAccount(namespace: ChainNamespace) {
    const isSmartAccountEnabled = ChainController.checkIfSmartAccountEnabled()

    return (
      isSmartAccountEnabled &&
      getPreferredAccountType(namespace) === W3mFrameRpcConstants.ACCOUNT_TYPES.EOA
    )
  },

  selectWalletConnector(wallet: WcWallet) {
    const redirectView = RouterController.state.data?.redirectView
    const connector = ConnectorController.getConnector({
      id: wallet.id,
      rdns: wallet.rdns
    })

    MobileWalletUtil.handleMobileDeeplinkRedirect(
      connector?.explorerId || wallet.id,
      ChainController.state.activeChain
    )

    if (connector) {
      RouterController.push('ConnectingExternal', { connector, wallet, redirectView })
    } else {
      RouterController.push('ConnectingWalletConnect', { wallet, redirectView })
    }
  },

  /**
   * Returns the connectors. If a namespace is provided, the connectors are filtered by namespace.
   * @param namespace - The namespace to filter the connectors by. If not provided, all connectors are returned.
   * @returns ConnectorWithProviders[].
   */
  getConnectors(namespace?: ChainNamespace) {
    if (namespace) {
      return ConnectorController.getConnectorsByNamespace(namespace)
    }

    return ConnectorController.mergeMultiChainConnectors(state.allConnectors)
  },

  /**
   * Sets the filter by namespace and updates the connectors.
   * @param namespace - The namespace to filter the connectors by.
   */
  setFilterByNamespace(namespace: ChainNamespace | undefined) {
    state.filterByNamespace = namespace
    state.connectors = ConnectorController.getConnectors(namespace)
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

// Export the controller wrapped with our error boundary
export const ConnectorController = withErrorBoundary(controller)
