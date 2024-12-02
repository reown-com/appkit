import { proxyMap, subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import type {
  AdapterAccountState,
  AdapterNetworkState,
  ChainAdapter,
  Connector
} from '../utils/TypeUtil.js'

import { AccountController, type AccountControllerState } from './AccountController.js'
import { PublicStateController } from './PublicStateController.js'
import {
  NetworkUtil,
  SafeLocalStorage,
  SafeLocalStorageKeys,
  type CaipAddress,
  type CaipNetwork,
  type CaipNetworkId,
  type ChainNamespace
} from '@reown/appkit-common'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { ConstantsUtil } from '../utils/ConstantsUtil.js'
import { ModalController } from './ModalController.js'
import { EventsController } from './EventsController.js'
import { RouterController } from './RouterController.js'

// -- Constants ----------------------------------------- //
const accountState: AccountControllerState = {
  currentTab: 0,
  tokenBalance: [],
  smartAccountDeployed: false,
  addressLabels: new Map(),
  allAccounts: []
}

const networkState: AdapterNetworkState = {
  supportsAllNetworks: true,
  smartAccountEnabledNetworks: []
}

// -- Types --------------------------------------------- //
export interface ChainControllerState {
  activeChain: ChainNamespace | undefined
  activeCaipAddress: CaipAddress | undefined
  activeCaipNetwork?: CaipNetwork
  chains: Map<ChainNamespace, ChainAdapter>
  activeConnector?: Connector
  universalAdapter: Pick<ChainAdapter, 'networkControllerClient' | 'connectionControllerClient'>
  noAdapters: boolean
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
  }
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

  initialize(adapters: ChainAdapter[]) {
    const adapterToActivate = adapters?.[0]
    if (adapters?.length === 0 || !adapterToActivate) {
      state.noAdapters = true
    }
    if (!state.noAdapters) {
      state.activeChain = adapterToActivate?.namespace
      PublicStateController.set({ activeChain: adapterToActivate?.namespace })
      adapters.forEach((adapter: ChainAdapter) => {
        state.chains.set(adapter.namespace as ChainNamespace, {
          namespace: adapter.namespace,
          connectionControllerClient: adapter.connectionControllerClient,
          networkControllerClient: adapter.networkControllerClient,
          adapterType: adapter.adapterType,
          accountState,
          networkState,
          caipNetworks: adapter.caipNetworks
        })
      })
    }
  },

  setAdapterNetworkState(chain: ChainNamespace, props: Partial<AdapterNetworkState>) {
    const chainAdapter = state.chains.get(chain)

    if (chainAdapter) {
      chainAdapter.networkState = ref({
        ...chainAdapter.networkState,
        ...props
      } as AdapterNetworkState)

      state.chains.set(chain, ref(chainAdapter))
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
      chainAdapter.accountState = ref({
        ...chainAdapter.accountState,
        ...accountProps
      } as AccountControllerState)
      state.chains.set(chain, chainAdapter)
      if (state.chains.size === 1 || state.activeChain === chain) {
        if (accountProps.caipAddress) {
          state.activeCaipAddress = accountProps.caipAddress
        }
        AccountController.replaceState(chainAdapter.accountState)
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
    this.setChainAccountData(
      chain,
      {
        [prop]: value
      },
      replaceState
    )
  },

  setActiveNamespace(chain: ChainNamespace | undefined) {
    state.activeChain = chain

    const newAdapter = chain ? state.chains.get(chain) : undefined
    const caipNetwork = newAdapter?.networkState?.caipNetwork

    if (caipNetwork?.id) {
      state.activeCaipAddress = newAdapter?.accountState?.caipAddress
      state.activeCaipNetwork = caipNetwork
      SafeLocalStorage.setItem(
        SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID,
        caipNetwork?.caipNetworkId
      )
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

    const newAdapter = state.chains.get(caipNetwork.chainNamespace)
    state.activeChain = caipNetwork.chainNamespace
    state.activeCaipNetwork = caipNetwork

    if (newAdapter?.accountState?.address) {
      state.activeCaipAddress = `${caipNetwork.chainNamespace}:${caipNetwork.id}:${newAdapter?.accountState?.address}`
    } else {
      state.activeCaipAddress = undefined
    }

    if (newAdapter) {
      AccountController.replaceState(newAdapter.accountState)
    }

    PublicStateController.set({
      activeChain: state.activeChain,
      selectedNetworkId: state.activeCaipNetwork?.caipNetworkId
    })
    SafeLocalStorage.setItem(SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID, caipNetwork.caipNetworkId)

    const isSupported = this.checkIfSupportedNetwork(caipNetwork.chainNamespace)

    if (!isSupported) {
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
    const networkControllerClient = this.getNetworkControllerClient(network.chainNamespace)

    if (networkControllerClient) {
      await networkControllerClient.switchCaipNetwork(network)
    }

    if (unsupportedNetwork) {
      RouterController.goBack()
    }

    this.setActiveCaipNetwork(network)

    if (network) {
      EventsController.sendEvent({
        type: 'track',
        event: 'SWITCH_NETWORK',
        properties: { network: network.caipNetworkId }
      })
    }
  },

  setActiveConnector(connector: ChainControllerState['activeConnector']) {
    if (connector) {
      state.activeConnector = ref(connector)
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

  getAccountProp<K extends keyof AdapterAccountState>(
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

  setRequestedCaipNetworks(requestedNetworks: CaipNetwork[], chain: ChainNamespace) {
    this.setAdapterNetworkState(chain, { requestedCaipNetworks: requestedNetworks })
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
    const activeCaipNetwork = this.state.activeCaipNetwork
    const requestedCaipNetworks = this.getRequestedCaipNetworks(namespace)

    if (!requestedCaipNetworks.length) {
      return true
    }

    return requestedCaipNetworks?.some(network => network.id === activeCaipNetwork?.id)
  },

  checkIfSupportedChainId(chainId: number | string) {
    if (!this.state.activeChain) {
      return true
    }

    const requestedCaipNetworks = this.getRequestedCaipNetworks(this.state.activeChain)

    return requestedCaipNetworks?.some(network => network.id === chainId)
  },

  // Smart Account Network Handlers
  setSmartAccountEnabledNetworks(smartAccountEnabledNetworks: number[], chain: ChainNamespace) {
    this.setAdapterNetworkState(chain, { smartAccountEnabledNetworks })
  },

  checkIfSmartAccountEnabled() {
    const networkId = NetworkUtil.caipNetworkIdToNumber(state.activeCaipNetwork?.caipNetworkId)
    const activeChain = this.state.activeChain

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
    const namespace = this.state.activeCaipNetwork?.chainNamespace || 'eip155'
    const chainId = this.state.activeCaipNetwork?.id || 1
    const address = ConstantsUtil.NATIVE_TOKEN_ADDRESS[namespace]

    return `${namespace}:${chainId}:${address}`
  },

  showUnsupportedChainUI() {
    setTimeout(() => {
      ModalController.open({ view: 'UnsupportedChain' })
    }, 300)
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

    this.state.activeCaipAddress = undefined
    this.setChainAccountData(
      chainToWrite,
      ref({
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
        provider: undefined,
        allAccounts: []
      })
    )
  }
}
