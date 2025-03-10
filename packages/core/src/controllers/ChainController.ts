import { proxy, subscribe as sub } from 'valtio/vanilla'
import { proxyMap, subscribeKey as subKey } from 'valtio/vanilla/utils'

import {
  type CaipAddress,
  type CaipNetwork,
  type CaipNetworkId,
  type ChainNamespace,
  ConstantsUtil as CommonConstantsUtil,
  NetworkUtil
} from '@reown/appkit-common'

import { ConstantsUtil } from '../utils/ConstantsUtil.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { StorageUtil } from '../utils/StorageUtil.js'
import type {
  AdapterNetworkState,
  ChainAdapter,
  NetworkControllerClient
} from '../utils/TypeUtil.js'
import { AccountController, type AccountControllerState } from './AccountController.js'
import { ConnectionController, type ConnectionControllerClient } from './ConnectionController.js'
import { ConnectorController } from './ConnectorController.js'
import { EventsController } from './EventsController.js'
import { ModalController } from './ModalController.js'
import { OptionsController } from './OptionsController.js'
import { PublicStateController } from './PublicStateController.js'
import { RouterController } from './RouterController.js'
import { SendController } from './SendController.js'

// -- Constants ----------------------------------------- //
const accountState: AccountControllerState = {
  currentTab: 0,
  tokenBalance: [],
  smartAccountDeployed: false,
  addressLabels: new Map(),
  allAccounts: [],
  user: undefined
}

const networkState: AdapterNetworkState = {
  supportsAllNetworks: true,
  smartAccountEnabledNetworks: []
}

// -- Types --------------------------------------------- //
export type ChainControllerClients = {
  networkControllerClient: NetworkControllerClient
  connectionControllerClient: ConnectionControllerClient
}
export interface ChainControllerState {
  activeChain: ChainNamespace | undefined
  activeCaipAddress: CaipAddress | undefined
  activeCaipNetwork?: CaipNetwork
  chains: Map<ChainNamespace, ChainAdapter>
  universalAdapter: Pick<ChainAdapter, 'networkControllerClient' | 'connectionControllerClient'>
  noAdapters: boolean
  isSwitchingNamespace: boolean
}

type ChainControllerStateKey = keyof ChainControllerState

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
export const ChainController = {
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
    const namespaces = new Set([...(caipNetworks?.map(network => network.chainNamespace) ?? [])])
    if (adapters?.length === 0 || !adapterToActivate) {
      state.noAdapters = true
    }

    if (!state.noAdapters) {
      state.activeChain = adapterToActivate?.namespace
      state.activeCaipNetwork = activeCaipNetwork

      if (state.activeChain) {
        PublicStateController.set({ activeChain: adapterToActivate?.namespace })
      }
    }

    namespaces.forEach(namespace => {
      const namespaceNetworks = caipNetworks?.filter(
        network => network.chainNamespace === namespace
      )
      ChainController.state.chains.set(namespace as ChainNamespace, {
        namespace,
        networkState: proxy(networkState),
        accountState: proxy(accountState),
        caipNetworks: namespaceNetworks ?? [],
        ...clients
      })
      this.setRequestedCaipNetworks(namespaceNetworks ?? [], namespace)
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
          this.setActiveCaipNetwork(caipNetwork)
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
    state.chains.set(adapter.namespace as ChainNamespace, {
      namespace: adapter.namespace,
      networkState,
      accountState,
      caipNetworks,
      connectionControllerClient,
      networkControllerClient
    })
    this.setRequestedCaipNetworks(
      caipNetworks?.filter(caipNetwork => caipNetwork.chainNamespace === adapter.namespace) ?? [],
      adapter.namespace as ChainNamespace
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
      this.setRequestedCaipNetworks(newNetworks, network.chainNamespace)
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
        this.setActiveCaipNetwork(chainAdapter.caipNetworks[0])
      }

      state.chains.set(namespace, { ...chainAdapter, caipNetworks: newCaipNetworksOfAdapter })
      this.setRequestedCaipNetworks(newCaipNetworksOfAdapter || [], namespace)
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
    accountProps: Partial<AccountControllerState>,
    _unknown = true
  ) {
    if (!chain) {
      throw new Error('Chain is required to update chain account data')
    }

    const chainAdapter = state.chains.get(chain)

    if (chainAdapter) {
      const newAccountState = { ...(chainAdapter.accountState || accountState), ...accountProps }
      state.chains.set(chain, { ...chainAdapter, accountState: newAccountState })
      if (state.chains.size === 1 || state.activeChain === chain) {
        if (accountProps.caipAddress) {
          state.activeCaipAddress = accountProps.caipAddress
        }
        AccountController.replaceState(newAccountState)
      }
    }
  },

  // eslint-disable-next-line max-params
  setAccountProp(
    prop: keyof AccountControllerState,
    value: AccountControllerState[keyof AccountControllerState],
    chain: ChainNamespace | undefined,
    replaceState = true
  ) {
    this.setChainAccountData(chain, { [prop]: value }, replaceState)
  },

  setActiveNamespace(chain: ChainNamespace | undefined) {
    state.activeChain = chain

    const newAdapter = chain ? state.chains.get(chain) : undefined
    const caipNetwork = newAdapter?.networkState?.caipNetwork

    if (caipNetwork?.id && chain) {
      state.activeCaipAddress = newAdapter?.accountState?.caipAddress
      state.activeCaipNetwork = caipNetwork
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

    if (state.activeChain !== caipNetwork.chainNamespace) {
      this.setIsSwitchingNamespace(true)
      ConnectorController.setFilterByNamespace(caipNetwork.chainNamespace)
    }

    const newAdapter = state.chains.get(caipNetwork.chainNamespace)
    state.activeChain = caipNetwork.chainNamespace
    state.activeCaipNetwork = caipNetwork
    if (newAdapter?.accountState?.address) {
      state.activeCaipAddress = `${caipNetwork.chainNamespace}:${caipNetwork.id}:${newAdapter?.accountState?.address}`
    } else {
      state.activeCaipAddress = undefined
    }

    // Update the chain's account state with the new caip address value
    this.setAccountProp('caipAddress', state.activeCaipAddress, caipNetwork.chainNamespace)

    if (newAdapter) {
      AccountController.replaceState(newAdapter.accountState)
    }
    // Reset send state when switching networks
    SendController.resetSend()

    PublicStateController.set({
      activeChain: state.activeChain,
      selectedNetworkId: state.activeCaipNetwork?.caipNetworkId
    })
    StorageUtil.setActiveCaipNetworkId(caipNetwork.caipNetworkId)

    const isSupported = this.checkIfSupportedNetwork(caipNetwork.chainNamespace)

    if (
      !isSupported &&
      !OptionsController.state.allowUnsupportedChain &&
      !ConnectionController.state.wcBasic
    ) {
      this.showUnsupportedChainUI()
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

  async switchActiveNetwork(network: CaipNetwork) {
    const activeAdapter = ChainController.state.chains.get(
      ChainController.state.activeChain as ChainNamespace
    )

    const unsupportedNetwork = !activeAdapter?.caipNetworks?.some(
      caipNetwork => caipNetwork.id === state.activeCaipNetwork?.id
    )

    if (unsupportedNetwork) {
      RouterController.goBack()
    }

    const networkControllerClient = this.getNetworkControllerClient(network.chainNamespace)

    if (networkControllerClient) {
      await networkControllerClient.switchCaipNetwork(network)
      EventsController.sendEvent({
        type: 'track',
        event: 'SWITCH_NETWORK',
        properties: { network: network.caipNetworkId }
      })
    }
  },

  getNetworkControllerClient(chainNamespace?: ChainNamespace) {
    const chain = chainNamespace || state.activeChain

    const chainAdapter = state.chains.get(chain as ChainNamespace)

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

  getAccountProp<K extends keyof AccountControllerState>(
    key: K,
    _chain?: ChainNamespace
  ): AccountControllerState[K] | undefined {
    let chain = state.activeChain

    if (_chain) {
      chain = _chain
    }

    if (!chain) {
      return undefined
    }

    const chainAccountState = state.chains.get(chain)?.accountState

    if (!chainAccountState) {
      return undefined
    }

    return chainAccountState[key]
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

    return sortedNetworks
  },

  getAllRequestedCaipNetworks(): CaipNetwork[] {
    const requestedCaipNetworks: CaipNetwork[] = []

    state.chains.forEach(chainAdapter => {
      const caipNetworks = this.getRequestedCaipNetworks(chainAdapter.namespace as ChainNamespace)
      requestedCaipNetworks.push(...caipNetworks)
    })

    return requestedCaipNetworks
  },

  setRequestedCaipNetworks(requestedCaipNetworks: CaipNetwork[], chain: ChainNamespace) {
    this.setAdapterNetworkState(chain, { requestedCaipNetworks })
  },

  getAllApprovedCaipNetworkIds(): CaipNetworkId[] {
    const approvedCaipNetworkIds: CaipNetworkId[] = []

    state.chains.forEach(chainAdapter => {
      const approvedIds = this.getApprovedCaipNetworkIds(chainAdapter.namespace as ChainNamespace)
      approvedCaipNetworkIds.push(...approvedIds)
    })

    return approvedCaipNetworkIds
  },

  getActiveCaipNetwork() {
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
    const networkControllerClient = this.getNetworkControllerClient()
    const data = await networkControllerClient?.getApprovedCaipNetworksData()

    this.setAdapterNetworkState(namespace, {
      approvedCaipNetworkIds: data?.approvedCaipNetworkIds,
      supportsAllNetworks: data?.supportsAllNetworks
    })
  },

  checkIfSupportedNetwork(namespace: ChainNamespace) {
    const activeCaipNetwork = state.activeCaipNetwork
    const requestedCaipNetworks = this.getRequestedCaipNetworks(namespace)

    if (!requestedCaipNetworks.length) {
      return true
    }

    return requestedCaipNetworks?.some(network => network.id === activeCaipNetwork?.id)
  },

  checkIfSupportedChainId(chainId: number | string) {
    if (!state.activeChain) {
      return true
    }

    const requestedCaipNetworks = this.getRequestedCaipNetworks(state.activeChain)

    return requestedCaipNetworks?.some(network => network.id === chainId)
  },

  // Smart Account Network Handlers
  setSmartAccountEnabledNetworks(smartAccountEnabledNetworks: number[], chain: ChainNamespace) {
    this.setAdapterNetworkState(chain, { smartAccountEnabledNetworks })
  },

  checkIfSmartAccountEnabled() {
    const networkId = NetworkUtil.caipNetworkIdToNumber(state.activeCaipNetwork?.caipNetworkId)
    const activeChain = state.activeChain

    if (!activeChain || !networkId) {
      return false
    }

    const smartAccountEnabledNetworks = this.getNetworkProp(
      'smartAccountEnabledNetworks',
      activeChain
    )

    return Boolean(smartAccountEnabledNetworks?.includes(Number(networkId)))
  },

  getActiveNetworkTokenAddress() {
    const namespace = state.activeCaipNetwork?.chainNamespace || 'eip155'
    const chainId = state.activeCaipNetwork?.id || 1
    const address = ConstantsUtil.NATIVE_TOKEN_ADDRESS[namespace]

    return `${namespace}:${chainId}:${address}`
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
    this.setAdapterNetworkState(namespace, {
      approvedCaipNetworkIds: undefined,
      supportsAllNetworks: true,
      smartAccountEnabledNetworks: []
    })
  },

  resetAccount(chain: ChainNamespace | undefined) {
    const chainToWrite = chain

    if (!chainToWrite) {
      throw new Error('Chain is required to set account prop')
    }

    state.activeCaipAddress = undefined
    this.setChainAccountData(chainToWrite, {
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
      preferredAccountType: undefined,
      socialProvider: undefined,
      socialWindow: undefined,
      farcasterUrl: undefined,
      allAccounts: [],
      user: undefined,
      status: 'disconnected'
    })
    StorageUtil.deleteConnectedConnectorId(chainToWrite)
  },

  async disconnect() {
    try {
      // Reset send state when disconnecting
      SendController.resetSend()
      const disconnectResults = await Promise.allSettled(
        Array.from(state.chains.entries()).map(async ([namespace, adapter]) => {
          try {
            if (adapter.connectionControllerClient?.disconnect) {
              await adapter.connectionControllerClient.disconnect()
            }
            this.resetAccount(namespace)
            this.resetNetwork(namespace)
          } catch (error) {
            throw new Error(`Failed to disconnect chain ${namespace}: ${(error as Error).message}`)
          }
        })
      )

      ConnectionController.resetWcConnection()

      const failures = disconnectResults.filter(
        (result): result is PromiseRejectedResult => result.status === 'rejected'
      )

      if (failures.length > 0) {
        throw new Error(failures.map(f => f.reason.message).join(', '))
      }

      StorageUtil.deleteConnectedSocialProvider()
      ConnectionController.resetWcConnection()
      ConnectorController.resetConnectorIds()
      EventsController.sendEvent({
        type: 'track',
        event: 'DISCONNECT_SUCCESS'
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error((error as Error).message || 'Failed to disconnect chains')
      EventsController.sendEvent({
        type: 'track',
        event: 'DISCONNECT_ERROR',
        properties: {
          message: (error as Error).message || 'Failed to disconnect chains'
        }
      })
    }
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

  getAccountDataByChainNamespace(chainNamespace?: ChainNamespace) {
    if (!chainNamespace) {
      if (!ChainController.state.activeChain) {
        return undefined
      }

      return ChainController.state.chains.get(ChainController.state.activeChain)?.accountState
    }

    return ChainController.state.chains.get(chainNamespace)?.accountState
  }
}
