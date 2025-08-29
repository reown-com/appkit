import type { SessionNamespace } from '@walletconnect/universal-provider'

import {
  type CaipAddress,
  type CaipNetwork,
  type CaipNetworkId,
  type ChainNamespace,
  ConstantsUtil as CommonConstantsUtil,
  ParseUtil
} from '@reown/appkit-common'

import type { NamespaceState } from '../../utils/TypeUtil copy.js'
import { withErrorBoundary } from '../../utils/withErrorBoundary.js'
import { ConnectorController } from '../ConnectorController.js'
import { chainActor } from './ChainActor.js'
import type { ChainContext, ChainState } from './ChainMachine.js'

// -- Types --------------------------------------------- //
export interface ChainControllerState {
  activeChain: ChainNamespace | undefined
  activeCaipNetwork?: CaipNetwork
  isSwitchingNamespace: boolean
  lastConnectedSIWECaipNetwork?: CaipNetwork
  namespaces: Map<ChainNamespace, NamespaceState>
  smartAccountEnabledNetworks?: CaipNetworkId[]
}

// -- Controller ---------------------------------------- //
const controller = {
  getSnapshot() {
    return chainActor.getSnapshot()
  },

  subscribe(callback: ({ context, state }: { context: ChainContext; state: ChainState }) => void) {
    return chainActor.subscribe(snapshot => {
      callback({ context: snapshot.context, state: snapshot.value })
    }).unsubscribe
  },

  subscribeNamespace(
    namespace: ChainNamespace,
    callback: ({
      namespaceState,
      state
    }: {
      namespaceState: NamespaceState
      state: ChainState
    }) => void
  ) {
    return chainActor.subscribe(snapshot => {
      const namespaceState = snapshot.context.namespaces.get(namespace)

      if (!namespaceState) {
        return
      }

      callback({ namespaceState, state: snapshot.value })
    }).unsubscribe
  },

  initialize(caipNetworks: CaipNetwork[] | undefined) {
    chainActor.start()
    chainActor.send({ type: 'INIT', caipNetworks })
  },

  addNetwork(network: CaipNetwork) {
    chainActor.send({ type: 'ADD_NETWORK', network })
  },

  removeNetwork(namespace: ChainNamespace, networkId: string | number) {
    chainActor.send({ type: 'REMOVE_NETWORK', namespace, networkId })
  },

  setActiveNamespace(namespace: ChainNamespace) {
    chainActor.send({ type: 'SWITCH_ACTIVE_NAMESPACE', namespace })
  },

  switchActiveNetwork(network: CaipNetwork) {
    chainActor.send({ type: 'SWITCH_ACTIVE_NETWORK', network })
  },

  refreshApprovedNetworks() {
    chainActor.send({ type: 'REFRESH_APPROVED_NETWORKS' })
  },

  getActiveCaipNetwork(chainNamespace?: ChainNamespace) {
    const { context } = chainActor.getSnapshot()

    if (chainNamespace) {
      const namespaceState = context.namespaces.get(chainNamespace)

      return namespaceState?.activeCaipNetwork
    }

    if (!context.activeChain) {
      return undefined
    }

    return context.namespaces.get(context.activeChain)?.activeCaipNetwork
  },

  getApprovedCaipNetworkIds(namespace?: ChainNamespace): CaipNetworkId[] {
    const { context } = chainActor.getSnapshot()
    const namespaceStates = namespace
      ? [context.namespaces.get(namespace)]
      : Array.from(context.namespaces.values())

    const approvedCaipNetworkIds = namespaceStates
      .flatMap(ns => ns?.approvedCaipNetworks || [])
      .map(n => n.caipNetworkId)

    return approvedCaipNetworkIds
  },

  // Move to utils
  getChainsFromNamespaces(namespaces: SessionNamespace): CaipNetworkId[] {
    return Object.values(namespaces).flatMap((namespace: SessionNamespace) => {
      const chains = (namespace.chains || []) as CaipNetworkId[]
      const accountsChains =
        namespace.accounts?.map(account => {
          const { chainId, chainNamespace } = ParseUtil.parseCaipAddress(account as CaipAddress)

          return `${chainNamespace}:${chainId}`
        }) || []

      return Array.from(new Set([...chains, ...accountsChains]))
    }) as CaipNetworkId[]
  },

  getApprovedCaipNetworksData(namespace: ChainNamespace) {
    const { context } = chainActor.getSnapshot()
    const namespaceState = context.namespaces.get(namespace)

    if (!namespaceState) {
      return { supportsAllNetworks: true, approvedCaipNetworkIds: [] }
    }

    const { activeCaipNetwork } = namespaceState

    return context.ports.getApprovedNetworksData({
      activeNamespace: namespace,
      activeNetwork: activeCaipNetwork,
      requestedCaipNetworks: namespaceState.requestedCaipNetworks ?? []
    })
  },
  checkIfSupportedNetwork(namespace: ChainNamespace, caipNetworkId?: CaipNetworkId) {
    const namespaceState = chainActor.getSnapshot().context.namespaces.get(namespace)

    return namespaceState?.requestedCaipNetworks?.some(
      network => network.caipNetworkId === caipNetworkId
    )
  },

  // Smart Account Network Handlers
  setSmartAccountEnabledNetworks(smartAccountEnabledNetworks: number[], namespace: ChainNamespace) {
    chainActor.send({
      type: 'SET_SMART_ACCOUNT_ENABLED',
      networkIds: smartAccountEnabledNetworks,
      namespace
    })
  },

  checkIfSmartAccountEnabled() {
    const { context } = chainActor.getSnapshot()
    const activeChain = context.activeChain

    if (!activeChain) {
      return false
    }

    const namespaceState = context.namespaces.get(activeChain)

    if (!namespaceState?.activeCaipNetwork) {
      return false
    }

    return context.smartAccountEnabledNetworks?.includes(
      namespaceState.activeCaipNetwork?.caipNetworkId as CaipNetworkId
    )
  },

  showUnsupportedChainUI() {
    const { context } = chainActor.getSnapshot()

    return context.ports.openUnsupportedChainUI()
  },

  checkIfNamesSupported(): boolean {
    const { context } = chainActor.getSnapshot()

    return Boolean(
      context.activeChain &&
        context.ports.flags.namesSupportedNamespaces.includes(context.activeChain)
    )
  },

  resetNetwork(namespace: ChainNamespace) {
    chainActor.send({ type: 'RESET_NETWORK', namespace })
  },

  getFirstCaipNetworkSupportsAuthConnector() {
    const { context } = chainActor.getSnapshot()
    const availableChains: ChainNamespace[] = []

    context.namespaces.keys().forEach(namespace => {
      if (CommonConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS.find(ns => ns === namespace)) {
        availableChains.push(namespace)
      }
    })

    if (availableChains.length > 0) {
      const firstAvailableChain = availableChains[0]
      const firstCaipNetwork = firstAvailableChain
        ? context.namespaces.get(firstAvailableChain)?.requestedCaipNetworks?.[0]
        : undefined

      return firstCaipNetwork
    }

    return undefined
  },

  getNetworkData(chainNamespace?: ChainNamespace) {
    const { context } = chainActor.getSnapshot()
    const namespace = chainNamespace || context.activeChain

    if (!namespace) {
      return undefined
    }

    return context.namespaces.get(namespace)
  },

  getCaipNetworkByNamespace(
    chainNamespace: ChainNamespace | undefined,
    chainId?: string | number | undefined
  ) {
    if (!chainNamespace) {
      return undefined
    }

    const { context } = chainActor.getSnapshot()
    const chain = context.namespaces.get(chainNamespace)
    const byChainId = chain?.requestedCaipNetworks?.find(
      network => network.caipNetworkId === chainId
    )

    if (byChainId) {
      return byChainId
    }

    return chain?.requestedCaipNetworks?.[0]
  },

  /**
   * Get the requested CaipNetwork IDs for a given namespace. If namespace is not provided, all requested CaipNetwork IDs will be returned
   * @param namespace - The namespace to get the requested CaipNetwork IDs for
   * @returns The requested CaipNetwork IDs
   */
  getRequestedCaipNetworkIds() {
    const { context } = chainActor.getSnapshot()
    const namespace = ConnectorController.state.filterByNamespace
    const chains = namespace
      ? [context.namespaces.get(namespace)]
      : Array.from(context.namespaces.values())

    return chains
      .flatMap(chain => chain?.requestedCaipNetworks || [])
      .map(caipNetwork => caipNetwork.caipNetworkId)
  },

  getCaipNetworks(namespace?: ChainNamespace) {
    const { context } = chainActor.getSnapshot()

    if (namespace) {
      return context.namespaces.get(namespace)?.requestedCaipNetworks
    }

    return Array.from(context.namespaces.values())
      .flatMap(chain => chain?.requestedCaipNetworks)
      .filter(Boolean) as CaipNetwork[]
  },

  setLastConnectedSIWECaipNetwork(network: CaipNetwork | undefined) {
    chainActor.send({ type: 'SET_LAST_SIWE_NETWORK', network })
  },

  getLastConnectedSIWECaipNetwork(): CaipNetwork | undefined {
    const { context } = chainActor.getSnapshot()

    return context.lastConnectedSIWECaipNetwork
  }
}

// Export the controller wrapped with our error boundary
export const ChainController = withErrorBoundary(controller)
