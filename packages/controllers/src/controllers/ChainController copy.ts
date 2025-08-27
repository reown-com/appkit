import type { SessionNamespace, UniversalProvider } from '@walletconnect/universal-provider'
import { proxy, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import {
  type CaipAddress,
  type CaipNetwork,
  type CaipNetworkId,
  type ChainNamespace,
  ConstantsUtil as CommonConstantsUtil,
  ParseUtil
} from '@reown/appkit-common'

import { ConstantsUtil } from '../utils/ConstantsUtil.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { StorageUtil } from '../utils/StorageUtil.js'
import type { NamespaceState } from '../utils/TypeUtil copy.js'
import { withErrorBoundary } from '../utils/withErrorBoundary.js'
import { ConnectionController } from './ConnectionController.js'
import { ConnectorController } from './ConnectorController.js'
import { EventsController } from './EventsController.js'
import { ModalController } from './ModalController.js'
import { OptionsController } from './OptionsController.js'
import { PublicStateController } from './PublicStateController.js'
import { RouterController } from './RouterController.js'
import { SendController } from './SendController.js'

// -- Types --------------------------------------------- //
export interface ChainControllerState {
  activeChain: ChainNamespace | undefined
  activeCaipNetwork?: CaipNetwork
  isSwitchingNamespace: boolean
  lastConnectedSIWECaipNetwork?: CaipNetwork
  namespaces: Map<ChainNamespace, NamespaceState>
  smartAccountEnabledNetworks?: CaipNetworkId[]
}

type ChainControllerStateKey = keyof ChainControllerState

// -- State --------------------------------------------- //
const state = proxy<ChainControllerState>({
  activeChain: undefined,
  activeCaipNetwork: undefined,
  isSwitchingNamespace: false,
  namespaces: new Map<ChainNamespace, NamespaceState>(),
  smartAccountEnabledNetworks: []
})

// -- Controller ---------------------------------------- //
const controller = {
  state,

  subscribe(callback: (value: ChainControllerState) => void) {
    return sub(state, () => {
      callback(state)
    })
  },

  subscribeKey<K extends ChainControllerStateKey>(
    key: K,
    callback: (value: ChainControllerState[K]) => void
  ) {
    return subKey(state, key, callback)
  },

  initialize(caipNetworks: CaipNetwork[] | undefined) {
    // Read from storage
    const { caipNetworkId, namespace } = StorageUtil.getActiveNetworkProps()

    const activeCaipNetwork = caipNetworks?.find(
      network => network.caipNetworkId.toString() === caipNetworkId?.toString()
    )

    const namespaces = new Set([...(caipNetworks?.map(network => network.chainNamespace) ?? [])])

    state.activeChain = namespace
    state.activeCaipNetwork = activeCaipNetwork
    if (state.activeChain) {
      PublicStateController.set({ activeChain: state.activeChain })
    }

    namespaces.forEach(ns => {
      const namespaceNetworks = caipNetworks?.filter(network => network.chainNamespace === ns)

      state.namespaces.set(ns, {
        activeCaipNetwork: namespaceNetworks?.[0],
        requestedCaipNetworks: namespaceNetworks ?? [],
        approvedCaipNetworkIds: []
      })
    })
  },

  addNetwork(network: CaipNetwork) {
    const namespaceState = state.namespaces.get(network.chainNamespace)

    if (namespaceState) {
      const newNetworks = [...(namespaceState.requestedCaipNetworks || [])]
      if (
        !namespaceState.requestedCaipNetworks?.find(caipNetwork => caipNetwork.id === network.id)
      ) {
        newNetworks.push(network)
      }
      state.namespaces.set(network.chainNamespace, {
        ...namespaceState,
        requestedCaipNetworks: newNetworks
      })
      ConnectorController.filterByNamespace(network.chainNamespace, true)
    }
  },

  removeNetwork(namespace: ChainNamespace, networkId: string | number) {
    const namespaceState = state.namespaces.get(namespace)

    if (namespaceState) {
      // Check if network being removed is active network
      const isActiveNetwork = state.activeCaipNetwork?.id === networkId

      // Filter out the network being removed
      const newCaipNetworksOfAdapter = [
        ...(namespaceState.requestedCaipNetworks?.filter(network => network.id !== networkId) || [])
      ]

      // If active network was removed and there are other networks available, switch to first one
      if (isActiveNetwork && namespaceState.requestedCaipNetworks?.[0]) {
        ChainController.setActiveCaipNetwork(namespaceState.requestedCaipNetworks[0])
      }

      state.namespaces.set(namespace, {
        ...namespaceState,
        requestedCaipNetworks: newCaipNetworksOfAdapter
      })

      if (newCaipNetworksOfAdapter.length === 0) {
        ConnectorController.filterByNamespace(namespace, false)
      }
    }
  },

  setActiveNamespace(chain: ChainNamespace) {
    if (chain === state.activeChain) {
      return
    }

    const namespaceState = state.namespaces.get(chain)
    const caipNetwork = namespaceState?.activeCaipNetwork

    state.activeChain = chain
    state.activeCaipNetwork = caipNetwork
    if (caipNetwork?.caipNetworkId) {
      ChainController.setActiveCaipNetwork(caipNetwork)
    }
  },

  setActiveCaipNetwork(caipNetwork?: CaipNetwork) {
    if (!caipNetwork) {
      return
    }
    const isSameNamespace = state.activeChain === caipNetwork.chainNamespace
    if (!isSameNamespace) {
      state.isSwitchingNamespace = true
    }

    state.activeChain = caipNetwork.chainNamespace
    state.activeCaipNetwork = caipNetwork

    // TOD: Trigger connection controller update?

    // Reset send state when switching networks
    SendController.resetSend()

    StorageUtil.setActiveCaipNetworkId(caipNetwork.caipNetworkId)
    PublicStateController.set({
      activeChain: state.activeChain,
      selectedNetworkId: state.activeCaipNetwork?.caipNetworkId
    })
  },

  addCaipNetwork(caipNetwork: CaipNetwork) {
    const namespaceState = state.namespaces.get(caipNetwork.chainNamespace)

    if (namespaceState) {
      const newNetworks = [...(namespaceState.requestedCaipNetworks || [])]
      const isNetworkAlreadyAdded = namespaceState.requestedCaipNetworks?.find(
        network => network.id === caipNetwork.id
      )
      if (!isNetworkAlreadyAdded) {
        newNetworks.push(caipNetwork)
      }
      state.namespaces.set(caipNetwork.chainNamespace, {
        ...namespaceState,
        requestedCaipNetworks: newNetworks
      })
    }
  },

  switchActiveNamespace(namespace: ChainNamespace) {
    if (namespace === state.activeChain) {
      return
    }

    const namespaceState = state.namespaces.get(namespace)
    const firstNetworkWithChain = namespaceState?.requestedCaipNetworks?.[0]

    if (!firstNetworkWithChain) {
      throw new Error('ChainController:switchActiveNamespace - no networks found')
    }

    ChainController.switchActiveNetwork(firstNetworkWithChain)
  },

  switchActiveNetwork(network: CaipNetwork) {
    const namespace = network.chainNamespace
    if (!namespace) {
      throw new Error('ChainController:switchActiveNetwork - network is malformed')
    }

    const namespaceState = state.namespaces.get(namespace)

    // This should be approvedCaipNetworks instead

    const isNetworkSupportedByApp = namespaceState?.requestedCaipNetworks?.some(
      caipNetwork => caipNetwork.id === network?.id
    )

    const isNetworkSupportedByProvider =
      namespaceState?.approvedCaipNetworkIds?.includes(network.caipNetworkId) ||
      namespaceState?.supportsAllNetworks

    if (!isNetworkSupportedByProvider) {
      throw new Error(
        'ChainController:switchActiveNetwork - network is not supported by the wallet'
      )
    }
    if (
      !isNetworkSupportedByApp &&
      OptionsController.state.enableNetworkSwitch &&
      !OptionsController.state.allowUnsupportedChain &&
      !ConnectionController.state.wcBasic
    ) {
      ChainController.showUnsupportedChainUI()

      return
    }

    try {
      ChainController.setActiveCaipNetwork(network)
      // await ConnectionController.onSwitchNetwork(network)
    } catch (error) {
      RouterController.goBack()
    }

    EventsController.sendEvent({
      type: 'track',
      event: 'SWITCH_NETWORK',
      properties: { network: network.caipNetworkId }
    })
  },

  getRequestedCaipNetworks(chainToFilter: ChainNamespace) {
    const namespaceState = state.namespaces.get(chainToFilter)
    const { approvedCaipNetworkIds = [], requestedCaipNetworks = [] } = namespaceState || {}
    const sortedNetworks = CoreHelperUtil.sortRequestedNetworks(
      approvedCaipNetworkIds,
      requestedCaipNetworks
    )
    const filteredNetworks = sortedNetworks.filter(network => network?.id)

    return filteredNetworks
  },

  getAllRequestedCaipNetworks(): CaipNetwork[] {
    const requestedCaipNetworks: CaipNetwork[] = []

    state.namespaces.keys().forEach(namespace => {
      const caipNetworks = ChainController.getRequestedCaipNetworks(namespace)
      requestedCaipNetworks.push(...caipNetworks)
    })

    return requestedCaipNetworks
  },

  setRequestedCaipNetworks(caipNetworks: CaipNetwork[], chain: ChainNamespace) {
    const namespaceState = state.namespaces.get(chain)
    if (namespaceState) {
      namespaceState.requestedCaipNetworks = caipNetworks
    }

    const allRequestedCaipNetworks = ChainController.getAllRequestedCaipNetworks()
    const namespaces = allRequestedCaipNetworks.map(network => network.chainNamespace)
    const uniqueNamespaces = Array.from(new Set(namespaces))
    ConnectorController.filterByNamespaces(uniqueNamespaces)
  },

  getAllApprovedCaipNetworkIds(): CaipNetworkId[] {
    const approvedCaipNetworkIds: CaipNetworkId[] = []

    state.namespaces.keys().forEach(namespace => {
      const approvedIds = ChainController.getApprovedCaipNetworkIds(namespace)
      approvedCaipNetworkIds.push(...approvedIds)
    })

    return approvedCaipNetworkIds
  },

  getActiveCaipNetwork(chainNamespace?: ChainNamespace) {
    if (chainNamespace) {
      return state.namespaces.get(chainNamespace)?.activeCaipNetwork
    }

    return state.activeCaipNetwork
  },

  getApprovedCaipNetworkIds(namespace: ChainNamespace): CaipNetworkId[] {
    const namespaceState = state.namespaces.get(namespace)
    const approvedCaipNetworkIds = namespaceState?.approvedCaipNetworkIds || []

    return approvedCaipNetworkIds
  },

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

  getApprovedCaipNetworksData() {
    const connections = ConnectionController.getConnections(state.activeChain)
    const connection = connections.find(
      conn => conn.caipNetwork?.id === state.activeCaipNetwork?.id
    )

    if (connection?.connectorId === 'walletConnect') {
      const connector = ConnectorController.getConnector({ id: connection.connectorId })
      const provider = connector?.provider as Awaited<ReturnType<typeof UniversalProvider.init>>

      return {
        /*
         * MetaMask Wallet only returns 1 namespace in the session object. This makes it imposible
         * to switch to other networks. Setting supportsAllNetworks to true for MetaMask Wallet
         * will make it possible to switch to other networks.
         */
        supportsAllNetworks: provider?.session?.peer?.metadata.name === 'MetaMask Wallet',
        approvedCaipNetworkIds: ChainController.getChainsFromNamespaces(
          provider?.session?.namespaces as unknown as SessionNamespace
        )
      }
    }

    return { supportsAllNetworks: true, approvedCaipNetworkIds: [] }
  },
  checkIfSupportedNetwork(namespace: ChainNamespace, caipNetworkId?: CaipNetworkId) {
    const activeCaipNetworkId = caipNetworkId || state.activeCaipNetwork?.caipNetworkId
    const requestedCaipNetworks = ChainController.getRequestedCaipNetworks(namespace)

    if (!requestedCaipNetworks.length) {
      return true
    }

    return requestedCaipNetworks?.some(network => network.caipNetworkId === activeCaipNetworkId)
  },

  checkIfSupportedChainId(chainId: number | string) {
    if (!state.activeChain) {
      return true
    }

    const requestedCaipNetworks = ChainController.getRequestedCaipNetworks(state.activeChain)

    return requestedCaipNetworks?.some(network => network.id === chainId)
  },

  // Smart Account Network Handlers
  setSmartAccountEnabledNetworks(smartAccountEnabledNetworks: number[], chain: ChainNamespace) {
    state.smartAccountEnabledNetworks = smartAccountEnabledNetworks.map(
      id => `${chain}:${id}` as const
    )
  },

  checkIfSmartAccountEnabled() {
    if (!state.activeCaipNetwork?.caipNetworkId) {
      return false
    }

    return state.smartAccountEnabledNetworks?.includes(state.activeCaipNetwork?.caipNetworkId)
  },

  showUnsupportedChainUI() {
    ModalController.open({ view: 'UnsupportedChain' })
  },

  checkIfNamesSupported(): boolean {
    const activeCaipNetwork = state.activeCaipNetwork

    return Boolean(
      activeCaipNetwork?.chainNamespace &&
        ConstantsUtil.NAMES_SUPPORTED_CHAIN_NAMESPACES.includes(activeCaipNetwork.chainNamespace)
    )
  },

  resetNetwork(namespace: ChainNamespace) {
    state.namespaces.set(namespace, {
      activeCaipNetwork: undefined,
      requestedCaipNetworks: [],
      approvedCaipNetworkIds: []
    })
  },

  getFirstCaipNetworkSupportsAuthConnector() {
    const availableChains: ChainNamespace[] = []
    let firstCaipNetwork: CaipNetwork | undefined = undefined

    state.namespaces.keys().forEach(namespace => {
      if (CommonConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS.find(ns => ns === namespace)) {
        availableChains.push(namespace)
      }
    })

    if (availableChains.length > 0) {
      const firstAvailableChain = availableChains[0]
      firstCaipNetwork = firstAvailableChain
        ? state.namespaces.get(firstAvailableChain)?.requestedCaipNetworks?.[0]
        : undefined

      return firstCaipNetwork
    }

    return undefined
  },

  getNetworkData(chainNamespace?: ChainNamespace) {
    const namespace = chainNamespace || state.activeChain

    if (!namespace) {
      return undefined
    }

    return state.namespaces.get(namespace)
  },

  getCaipNetworkByNamespace(
    chainNamespace: ChainNamespace | undefined,
    chainId?: string | number | undefined
  ) {
    if (!chainNamespace) {
      return undefined
    }

    const chain = state.namespaces.get(chainNamespace)
    const byChainId = chain?.requestedCaipNetworks?.find(network => network.id === chainId)

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
    const namespace = ConnectorController.state.filterByNamespace
    const chains = namespace
      ? [state.namespaces.get(namespace)]
      : Array.from(state.namespaces.values())

    return chains
      .flatMap(chain => chain?.requestedCaipNetworks || [])
      .map(caipNetwork => caipNetwork.caipNetworkId)
  },

  getCaipNetworks(namespace?: ChainNamespace) {
    if (namespace) {
      return ChainController.getRequestedCaipNetworks(namespace)
    }

    return ChainController.getAllRequestedCaipNetworks()
  },

  setLastConnectedSIWECaipNetwork(network: CaipNetwork | undefined) {
    state.lastConnectedSIWECaipNetwork = network
  },

  getLastConnectedSIWECaipNetwork(): CaipNetwork | undefined {
    return state.lastConnectedSIWECaipNetwork
  }
}

// Export the controller wrapped with our error boundary
export const ChainController = withErrorBoundary(controller)
