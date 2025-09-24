import { proxy, subscribe as sub } from 'valtio/vanilla'
import { proxyMap, subscribeKey as subKey } from 'valtio/vanilla/utils'

import {
  type Balance,
  type CaipAddress,
  type CaipNetwork,
  type CaipNetworkId,
  type ChainNamespace,
  ConstantsUtil as CommonConstantsUtil,
  NetworkUtil,
  ParseUtil,
  type SocialProvider
} from '@reown/appkit-common'

import { BalanceUtil } from '../utils/BalanceUtil.js'
import { ConstantsUtil } from '../utils/ConstantsUtil.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { StorageUtil } from '../utils/StorageUtil.js'
import type {
  AdapterNetworkState,
  ChainAdapter,
  ConnectedWalletInfo,
  NamespaceTypeMap,
  NetworkControllerClient,
  User
} from '../utils/TypeUtil.js'
import { withErrorBoundary } from '../utils/withErrorBoundary.js'
import { ConnectionController, type ConnectionControllerClient } from './ConnectionController.js'
import { ConnectorController } from './ConnectorController.js'
import { EventsController } from './EventsController.js'
import { ModalController } from './ModalController.js'
import { OptionsController } from './OptionsController.js'
import { PublicStateController } from './PublicStateController.js'
import { RouterController } from './RouterController.js'
import { SendController } from './SendController.js'
import { SnackController } from './SnackController.js'

// -- Constants ----------------------------------------- //
const defaultAccountState: AccountState = {
  currentTab: 0,
  tokenBalance: [],
  smartAccountDeployed: false,
  addressLabels: new Map(),
  user: undefined,
  preferredAccountType: undefined
}

const networkState: AdapterNetworkState = {
  caipNetwork: undefined,
  supportsAllNetworks: true,
  smartAccountEnabledNetworks: []
}

// -- Types --------------------------------------------- //
export type ChainControllerClients = {
  networkControllerClient: NetworkControllerClient
  connectionControllerClient: ConnectionControllerClient
}

export interface AccountState {
  currentTab: number
  caipAddress?: CaipAddress
  user?: User
  address?: string
  addressLabels: Map<string, string>
  balance?: string
  balanceSymbol?: string
  balanceLoading?: boolean
  profileName?: string | null
  profileImage?: string | null
  addressExplorerUrl?: string
  smartAccountDeployed?: boolean
  socialProvider?: SocialProvider
  tokenBalance?: Balance[]
  shouldUpdateToAddress?: string
  connectedWalletInfo?: ConnectedWalletInfo
  preferredAccountType?: NamespaceTypeMap[keyof NamespaceTypeMap]
  socialWindow?: Window
  farcasterUrl?: string
  status?: 'reconnecting' | 'connected' | 'disconnected' | 'connecting'
  lastRetry?: number
}

export interface ChainControllerState {
  activeChain: ChainNamespace | undefined
  activeCaipAddress: CaipAddress | undefined
  activeCaipNetwork?: CaipNetwork
  chains: Map<ChainNamespace, ChainAdapter>
  universalAdapter: Pick<ChainAdapter, 'networkControllerClient' | 'connectionControllerClient'>
  noAdapters: boolean
  isSwitchingNamespace: boolean
  lastConnectedSIWECaipNetwork?: CaipNetwork
}

type ChainControllerStateKey = keyof ChainControllerState

export interface SwitchActiveNetworkOptions {
  throwOnFailure?: boolean
}

// -- State --------------------------------------------- //
const state = proxy<ChainControllerState>({
  chains: proxyMap<ChainNamespace, ChainAdapter>(),
  activeCaipAddress: undefined,
  activeChain: undefined,
  activeCaipNetwork: undefined,
  noAdapters: false,
  universalAdapter: {
    networkControllerClient: undefined,
    connectionControllerClient: undefined
  },
  isSwitchingNamespace: false
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
  subscribeAccountStateProp(
    property: keyof AccountState,
    callback: (value: AccountState[keyof AccountState]) => void,
    chain?: ChainNamespace
  ) {
    const activeChain = chain || state.activeChain

    if (!activeChain) {
      return () => undefined
    }

    return subKey(
      state.chains.get(activeChain)?.accountState || ({} as AccountState),
      property,
      callback
    )
  },

  subscribeChainProp<K extends keyof ChainAdapter>(
    property: K,
    callback: (value: ChainAdapter[K] | undefined) => void,
    chain?: ChainNamespace
  ) {
    let prev: ChainAdapter[K] | undefined = undefined

    return sub(state.chains, () => {
      const activeChain = chain || state.activeChain

      if (activeChain) {
        const nextValue = state.chains.get(activeChain)?.[property]
        if (prev !== nextValue) {
          prev = nextValue
          callback(nextValue)
        }
      }
    })
  },

  initialize(
    adapters: ChainAdapter[],
    caipNetworks: CaipNetwork[] | undefined,
    clients: {
      connectionControllerClient: ConnectionControllerClient
      networkControllerClient: NetworkControllerClient
    }
  ) {
    const { chainId: activeChainId, namespace: activeNamespace } =
      StorageUtil.getActiveNetworkProps()
    const activeCaipNetwork = caipNetworks?.find(
      network => network.id.toString() === activeChainId?.toString()
    )

    const defaultAdapter = adapters.find(adapter => adapter?.namespace === activeNamespace)
    const adapterToActivate = defaultAdapter || adapters?.[0]

    const namespacesFromAdapters = adapters.map(a => a.namespace).filter(n => n !== undefined)

    /**
     * If the AppKit is in embedded mode (for Demo app), we should get the available namespaces from the adapters.
     */
    const namespaces = OptionsController.state.enableEmbedded
      ? new Set([...namespacesFromAdapters])
      : new Set([...(caipNetworks?.map(network => network.chainNamespace) ?? [])])

    if (adapters?.length === 0 || !adapterToActivate) {
      state.noAdapters = true
    }

    if (!state.noAdapters) {
      state.activeChain = adapterToActivate?.namespace
      state.activeCaipNetwork = activeCaipNetwork
      ChainController.setChainNetworkData(adapterToActivate?.namespace, {
        caipNetwork: activeCaipNetwork
      })

      if (state.activeChain) {
        PublicStateController.set({ activeChain: adapterToActivate?.namespace })
      }
    }

    namespaces.forEach(namespace => {
      const namespaceNetworks = caipNetworks?.filter(
        network => network.chainNamespace === namespace
      )

      const storedAccountTypes = StorageUtil.getPreferredAccountTypes() || {}
      const defaultTypes = { ...OptionsController.state.defaultAccountTypes, ...storedAccountTypes }

      ChainController.state.chains.set(namespace, {
        namespace,
        networkState: proxy({ ...networkState, caipNetwork: namespaceNetworks?.[0] }),
        accountState: proxy({
          ...defaultAccountState,
          preferredAccountType: defaultTypes[namespace]
        }),
        caipNetworks: namespaceNetworks ?? [],
        ...clients
      })
      ChainController.setRequestedCaipNetworks(namespaceNetworks ?? [], namespace)
    })
  },

  removeAdapter(namespace: ChainNamespace) {
    if (state.activeChain === namespace) {
      const nextAdapter = Array.from(state.chains.entries()).find(
        ([chainNamespace]) => chainNamespace !== namespace
      )
      if (nextAdapter) {
        const caipNetwork = nextAdapter[1]?.caipNetworks?.[0]
        if (caipNetwork) {
          ChainController.setActiveCaipNetwork(caipNetwork)
        }
      }
    }
    state.chains.delete(namespace)
  },

  addAdapter(
    adapter: ChainAdapter,
    { networkControllerClient, connectionControllerClient }: ChainControllerClients,
    caipNetworks: [CaipNetwork, ...CaipNetwork[]]
  ) {
    if (!adapter.namespace) {
      throw new Error('ChainController:addAdapter - adapter must have a namespace')
    }

    state.chains.set(adapter.namespace, {
      namespace: adapter.namespace,
      networkState: { ...networkState, caipNetwork: caipNetworks[0] },
      accountState: { ...defaultAccountState },
      caipNetworks,
      connectionControllerClient,
      networkControllerClient
    })
    ChainController.setRequestedCaipNetworks(
      caipNetworks?.filter(caipNetwork => caipNetwork.chainNamespace === adapter.namespace) ?? [],
      adapter.namespace
    )
  },

  addNetwork(network: CaipNetwork) {
    const chainAdapter = state.chains.get(network.chainNamespace)

    if (chainAdapter) {
      const newNetworks = [...(chainAdapter.caipNetworks || [])]
      if (!chainAdapter.caipNetworks?.find(caipNetwork => caipNetwork.id === network.id)) {
        newNetworks.push(network)
      }
      state.chains.set(network.chainNamespace, { ...chainAdapter, caipNetworks: newNetworks })
      ChainController.setRequestedCaipNetworks(newNetworks, network.chainNamespace)
      ConnectorController.filterByNamespace(network.chainNamespace, true)
    }
  },

  removeNetwork(namespace: ChainNamespace, networkId: string | number) {
    const chainAdapter = state.chains.get(namespace)

    if (chainAdapter) {
      // Check if network being removed is active network
      const isActiveNetwork = state.activeCaipNetwork?.id === networkId

      // Filter out the network being removed
      const newCaipNetworksOfAdapter = [
        ...(chainAdapter.caipNetworks?.filter(network => network.id !== networkId) || [])
      ]

      // If active network was removed and there are other networks available, switch to first one
      if (isActiveNetwork && chainAdapter?.caipNetworks?.[0]) {
        ChainController.setActiveCaipNetwork(chainAdapter.caipNetworks[0])
      }

      state.chains.set(namespace, { ...chainAdapter, caipNetworks: newCaipNetworksOfAdapter })
      ChainController.setRequestedCaipNetworks(newCaipNetworksOfAdapter || [], namespace)

      if (newCaipNetworksOfAdapter.length === 0) {
        ConnectorController.filterByNamespace(namespace, false)
      }
    }
  },

  setAdapterNetworkState(chain: ChainNamespace, props: Partial<AdapterNetworkState>) {
    const chainAdapter = state.chains.get(chain)

    if (chainAdapter) {
      chainAdapter.networkState = {
        ...(chainAdapter.networkState || networkState),
        ...props
      } as AdapterNetworkState

      state.chains.set(chain, chainAdapter)
    }
  },

  setChainAccountData(
    chain: ChainNamespace | undefined,
    accountProps: Partial<AccountState>,
    _unknown = true
  ) {
    if (!chain) {
      throw new Error('Chain is required to update chain account data')
    }

    const chainAdapter = state.chains.get(chain)

    if (chainAdapter) {
      const newAccountState = {
        ...(chainAdapter.accountState || defaultAccountState),
        ...accountProps
      }
      state.chains.set(chain, { ...chainAdapter, accountState: newAccountState })
      if (state.chains.size === 1 || state.activeChain === chain) {
        if (accountProps.caipAddress) {
          state.activeCaipAddress = accountProps.caipAddress
        }
      }
    }
  },

  setChainNetworkData(
    chain: ChainNamespace | undefined,
    networkProps: Partial<AdapterNetworkState>
  ) {
    if (!chain) {
      return
    }
    const chainAdapter = state.chains.get(chain)
    if (chainAdapter) {
      const newNetworkState = { ...(chainAdapter.networkState || networkState), ...networkProps }
      state.chains.set(chain, { ...chainAdapter, networkState: newNetworkState })
    }
  },

  // eslint-disable-next-line max-params
  setAccountProp(
    prop: keyof AccountState,
    value: AccountState[keyof AccountState],
    chain: ChainNamespace | undefined,
    replaceState = true
  ) {
    ChainController.setChainAccountData(chain, { [prop]: value }, replaceState)
  },

  setActiveNamespace(chain: ChainNamespace | undefined) {
    state.activeChain = chain

    const newAdapter = chain ? state.chains.get(chain) : undefined
    const caipNetwork = newAdapter?.networkState?.caipNetwork

    if (caipNetwork?.id && chain) {
      state.activeCaipAddress = newAdapter?.accountState?.caipAddress
      state.activeCaipNetwork = caipNetwork
      ChainController.setChainNetworkData(chain, { caipNetwork })
      StorageUtil.setActiveCaipNetworkId(caipNetwork?.caipNetworkId)
      PublicStateController.set({
        activeChain: chain,
        selectedNetworkId: caipNetwork?.caipNetworkId
      })
    }
  },

  setActiveCaipNetwork(caipNetwork: AdapterNetworkState['caipNetwork']) {
    if (!caipNetwork) {
      return
    }
    const isSameNamespace = state.activeChain === caipNetwork.chainNamespace
    if (!isSameNamespace) {
      ChainController.setIsSwitchingNamespace(true)
    }

    const newAdapter = state.chains.get(caipNetwork.chainNamespace)
    state.activeChain = caipNetwork.chainNamespace
    state.activeCaipNetwork = caipNetwork
    ChainController.setChainNetworkData(caipNetwork.chainNamespace, { caipNetwork })

    let address = newAdapter?.accountState?.address
    if (address) {
      state.activeCaipAddress = `${caipNetwork.chainNamespace}:${caipNetwork.id}:${address}`
    } else if (isSameNamespace && state.activeCaipAddress) {
      const { address: parsedAddress } = ParseUtil.parseCaipAddress(state.activeCaipAddress)
      address = parsedAddress
      state.activeCaipAddress = `${caipNetwork.caipNetworkId}:${address}`
    } else {
      state.activeCaipAddress = undefined
    }

    ChainController.setChainAccountData(caipNetwork.chainNamespace, {
      address,
      caipAddress: state.activeCaipAddress
    })

    // Reset send state when switching networks
    SendController.resetSend()

    PublicStateController.set({
      activeChain: state.activeChain,
      selectedNetworkId: state.activeCaipNetwork?.caipNetworkId
    })
    StorageUtil.setActiveCaipNetworkId(caipNetwork.caipNetworkId)

    const isSupported = ChainController.checkIfSupportedNetwork(caipNetwork.chainNamespace)

    if (
      !isSupported &&
      OptionsController.state.enableNetworkSwitch &&
      !OptionsController.state.allowUnsupportedChain &&
      !ConnectionController.state.wcBasic
    ) {
      ChainController.showUnsupportedChainUI()
    }
  },

  addCaipNetwork(caipNetwork: AdapterNetworkState['caipNetwork']) {
    if (!caipNetwork) {
      return
    }

    const chain = state.chains.get(caipNetwork.chainNamespace)
    if (chain) {
      chain?.caipNetworks?.push(caipNetwork)
    }
  },

  async switchActiveNamespace(namespace: ChainNamespace | undefined) {
    if (!namespace) {
      return
    }

    const isDifferentChain = namespace !== ChainController.state.activeChain
    const caipNetworkOfNamespace = ChainController.getNetworkData(namespace)?.caipNetwork
    const firstNetworkWithChain = ChainController.getCaipNetworkByNamespace(
      namespace,
      caipNetworkOfNamespace?.id
    )

    if (isDifferentChain && firstNetworkWithChain) {
      await ChainController.switchActiveNetwork(firstNetworkWithChain)
    }
  },

  async switchActiveNetwork(
    network: CaipNetwork,
    { throwOnFailure = false }: SwitchActiveNetworkOptions = {}
  ) {
    const namespace = ChainController.state.activeChain
    if (!namespace) {
      throw new Error('ChainController:switchActiveNetwork - namespace is required')
    }

    const activeAdapter = ChainController.state.chains.get(namespace)

    const unsupportedNetwork = !activeAdapter?.caipNetworks?.some(
      caipNetwork => caipNetwork.id === state.activeCaipNetwork?.id
    )

    const networkControllerClient = ChainController.getNetworkControllerClient(
      network.chainNamespace
    )

    if (networkControllerClient) {
      try {
        await networkControllerClient.switchCaipNetwork(network)
        if (unsupportedNetwork) {
          ModalController.close()
        }
      } catch (error) {
        if (throwOnFailure) {
          throw error
        }

        RouterController.goBack()
      }

      EventsController.sendEvent({
        type: 'track',
        event: 'SWITCH_NETWORK',
        properties: { network: network.caipNetworkId }
      })
    }
  },

  getNetworkControllerClient(chainNamespace?: ChainNamespace) {
    const chain = chainNamespace || state.activeChain

    if (!chain) {
      throw new Error('ChainController:getNetworkControllerClient - chain is required')
    }

    const chainAdapter = state.chains.get(chain)

    if (!chainAdapter) {
      throw new Error('Chain adapter not found')
    }

    if (!chainAdapter.networkControllerClient) {
      throw new Error('NetworkController client not set')
    }

    return chainAdapter.networkControllerClient
  },

  getConnectionControllerClient(_chain?: ChainNamespace) {
    const chain = _chain || state.activeChain

    if (!chain) {
      throw new Error('Chain is required to get connection controller client')
    }

    const chainAdapter = state.chains.get(chain)

    if (!chainAdapter?.connectionControllerClient) {
      throw new Error('ConnectionController client not set')
    }

    return chainAdapter.connectionControllerClient
  },

  getNetworkProp<K extends keyof AdapterNetworkState>(
    key: K,
    namespace: ChainNamespace
  ): AdapterNetworkState[K] | undefined {
    const chainNetworkState = state.chains.get(namespace)?.networkState

    if (!chainNetworkState) {
      return undefined
    }

    return chainNetworkState[key]
  },

  getRequestedCaipNetworks(chainToFilter: ChainNamespace) {
    const adapter = state.chains.get(chainToFilter)
    const { approvedCaipNetworkIds = [], requestedCaipNetworks = [] } = adapter?.networkState || {}
    const sortedNetworks = CoreHelperUtil.sortRequestedNetworks(
      approvedCaipNetworkIds,
      requestedCaipNetworks
    )
    const filteredNetworks = sortedNetworks.filter(network => network?.id)

    return filteredNetworks
  },

  getAllRequestedCaipNetworks(): CaipNetwork[] {
    const requestedCaipNetworks: CaipNetwork[] = []

    state.chains.forEach(chainAdapter => {
      if (!chainAdapter.namespace) {
        throw new Error(
          'ChainController:getAllRequestedCaipNetworks - chainAdapter must have a namespace'
        )
      }

      const caipNetworks = ChainController.getRequestedCaipNetworks(chainAdapter.namespace)
      requestedCaipNetworks.push(...caipNetworks)
    })

    return requestedCaipNetworks
  },

  setRequestedCaipNetworks(caipNetworks: CaipNetwork[], chain: ChainNamespace) {
    ChainController.setAdapterNetworkState(chain, { requestedCaipNetworks: caipNetworks })
    const allRequestedCaipNetworks = ChainController.getAllRequestedCaipNetworks()
    const namespaces = allRequestedCaipNetworks.map(network => network.chainNamespace)
    const uniqueNamespaces = Array.from(new Set(namespaces))
    ConnectorController.filterByNamespaces(uniqueNamespaces)
  },

  getAllApprovedCaipNetworkIds(): CaipNetworkId[] {
    const approvedCaipNetworkIds: CaipNetworkId[] = []

    state.chains.forEach(chainAdapter => {
      if (!chainAdapter.namespace) {
        throw new Error(
          'ChainController:getAllApprovedCaipNetworkIds - chainAdapter must have a namespace'
        )
      }

      const approvedIds = ChainController.getApprovedCaipNetworkIds(chainAdapter.namespace)
      approvedCaipNetworkIds.push(...approvedIds)
    })

    return approvedCaipNetworkIds
  },

  getActiveCaipNetwork(chainNamespace?: ChainNamespace) {
    if (chainNamespace) {
      return state.chains.get(chainNamespace)?.networkState?.caipNetwork
    }

    return state.activeCaipNetwork
  },

  getActiveCaipAddress() {
    return state.activeCaipAddress
  },

  getApprovedCaipNetworkIds(namespace: ChainNamespace): CaipNetworkId[] {
    const adapter = state.chains.get(namespace)
    const approvedCaipNetworkIds = adapter?.networkState?.approvedCaipNetworkIds || []

    return approvedCaipNetworkIds
  },

  async setApprovedCaipNetworksData(namespace: ChainNamespace) {
    const networkControllerClient = ChainController.getNetworkControllerClient()
    const data = await networkControllerClient?.getApprovedCaipNetworksData()

    ChainController.setAdapterNetworkState(namespace, {
      approvedCaipNetworkIds: data?.approvedCaipNetworkIds,
      supportsAllNetworks: data?.supportsAllNetworks
    })
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
    ChainController.setAdapterNetworkState(chain, { smartAccountEnabledNetworks })
  },

  checkIfSmartAccountEnabled() {
    const networkId = NetworkUtil.caipNetworkIdToNumber(state.activeCaipNetwork?.caipNetworkId)
    const activeChain = state.activeChain

    if (!activeChain || !networkId) {
      return false
    }

    const smartAccountEnabledNetworks = ChainController.getNetworkProp(
      'smartAccountEnabledNetworks',
      activeChain
    )

    return Boolean(smartAccountEnabledNetworks?.includes(Number(networkId)))
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
    ChainController.setAdapterNetworkState(namespace, {
      approvedCaipNetworkIds: undefined,
      supportsAllNetworks: true
    })
  },

  resetAccount(chain: ChainNamespace | undefined) {
    const chainToWrite = chain

    if (!chainToWrite) {
      throw new Error('Chain is required to set account prop')
    }

    const currentAccountType =
      ChainController.state.chains.get(chainToWrite)?.accountState?.preferredAccountType
    const optionsAccountType = OptionsController.state.defaultAccountTypes[chainToWrite]

    state.activeCaipAddress = undefined
    ChainController.setChainAccountData(chainToWrite, {
      smartAccountDeployed: false,
      currentTab: 0,
      caipAddress: undefined,
      address: undefined,
      balance: undefined,
      balanceSymbol: undefined,
      profileName: undefined,
      profileImage: undefined,
      addressExplorerUrl: undefined,
      tokenBalance: [],
      connectedWalletInfo: undefined,
      preferredAccountType: optionsAccountType || currentAccountType,
      socialProvider: undefined,
      socialWindow: undefined,
      farcasterUrl: undefined,
      user: undefined,
      status: 'disconnected'
    })
    ConnectorController.removeConnectorId(chainToWrite)
  },

  setIsSwitchingNamespace(isSwitchingNamespace: boolean) {
    state.isSwitchingNamespace = isSwitchingNamespace
  },

  getFirstCaipNetworkSupportsAuthConnector() {
    const availableChains: ChainNamespace[] = []
    let firstCaipNetwork: CaipNetwork | undefined = undefined

    state.chains.forEach(chain => {
      if (CommonConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS.find(ns => ns === chain.namespace)) {
        if (chain.namespace) {
          availableChains.push(chain.namespace)
        }
      }
    })

    if (availableChains.length > 0) {
      const firstAvailableChain = availableChains[0]
      firstCaipNetwork = firstAvailableChain
        ? state.chains.get(firstAvailableChain)?.caipNetworks?.[0]
        : undefined

      return firstCaipNetwork
    }

    return undefined
  },

  getAccountData(chainNamespace?: ChainNamespace) {
    const namespace = chainNamespace || state.activeChain

    if (!namespace) {
      return undefined
    }

    return ChainController.state.chains.get(namespace)?.accountState
  },

  getNetworkData(chainNamespace?: ChainNamespace) {
    const namespace = chainNamespace || state.activeChain

    if (!namespace) {
      return undefined
    }

    return ChainController.state.chains.get(namespace)?.networkState
  },

  getCaipNetworkByNamespace(
    chainNamespace: ChainNamespace | undefined,
    chainId?: string | number | undefined
  ) {
    if (!chainNamespace) {
      return undefined
    }

    const chain = ChainController.state.chains.get(chainNamespace)
    const byChainId = chain?.caipNetworks?.find(network => network.id === chainId)

    if (byChainId) {
      return byChainId
    }

    return chain?.networkState?.caipNetwork || chain?.caipNetworks?.[0]
  },

  /**
   * Get the requested CaipNetwork IDs for a given namespace. If namespace is not provided, all requested CaipNetwork IDs will be returned
   * @param namespace - The namespace to get the requested CaipNetwork IDs for
   * @returns The requested CaipNetwork IDs
   */
  getRequestedCaipNetworkIds() {
    const namespace = ConnectorController.state.filterByNamespace
    const chains = namespace ? [state.chains.get(namespace)] : Array.from(state.chains.values())

    return chains
      .flatMap(chain => chain?.caipNetworks || [])
      .map(caipNetwork => caipNetwork.caipNetworkId)
  },

  getCaipNetworks(namespace?: ChainNamespace) {
    if (namespace) {
      return ChainController.getRequestedCaipNetworks(namespace)
    }

    return ChainController.getAllRequestedCaipNetworks()
  },

  getCaipNetworkById(id: string | number, namespace?: ChainNamespace) {
    return controller
      .getCaipNetworks(namespace)
      .find(n => n.id.toString() === id.toString() || n.caipNetworkId.toString() === id.toString())
  },

  setLastConnectedSIWECaipNetwork(network: CaipNetwork | undefined) {
    state.lastConnectedSIWECaipNetwork = network
  },

  getLastConnectedSIWECaipNetwork(): CaipNetwork | undefined {
    return state.lastConnectedSIWECaipNetwork
  },
  async fetchTokenBalance(onError?: (error: unknown) => void): Promise<Balance[]> {
    const accountState = ChainController.getAccountData()
    if (!accountState) {
      return []
    }

    const chainId = ChainController.state.activeCaipNetwork?.caipNetworkId
    const chain = ChainController.state.activeCaipNetwork?.chainNamespace
    const caipAddress = ChainController.state.activeCaipAddress
    const address = caipAddress ? CoreHelperUtil.getPlainAddress(caipAddress) : undefined

    ChainController.setAccountProp('balanceLoading', true, chain)
    if (
      accountState.lastRetry &&
      !CoreHelperUtil.isAllowedRetry(accountState.lastRetry, 30 * ConstantsUtil.ONE_SEC_MS)
    ) {
      ChainController.setAccountProp('balanceLoading', false, chain)

      return []
    }

    try {
      if (address && chainId && chain) {
        const balance = await BalanceUtil.getMyTokensWithBalance()

        ChainController.setAccountProp('tokenBalance', balance, chain)
        ChainController.setAccountProp('lastRetry', undefined, chain)
        ChainController.setAccountProp('balanceLoading', false, chain)

        return balance
      }
    } catch (error) {
      ChainController.setAccountProp('lastRetry', Date.now(), chain)

      onError?.(error)
      SnackController.showError('Token Balance Unavailable')
    } finally {
      ChainController.setAccountProp('balanceLoading', false, chain)
    }

    return []
  }
}

// Export the controller wrapped with our error boundary
export const ChainController = withErrorBoundary(controller)
