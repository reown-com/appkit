import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import { proxyMap, subscribeKey as subKey } from 'valtio/vanilla/utils'
import type { ChainAdapter, Connector } from '../utils/TypeUtil.js'

import {
  SafeLocalStorage,
  SafeLocalStorageKeys,
  type CaipAddress,
  type CaipNetwork,
  type ChainNamespace
} from '@reown/appkit-common'
import { StorageUtil } from '../utils/StorageUtil.js'
import { AccountController, type AccountControllerState } from './AccountController.js'
import { NetworkController, type NetworkControllerState } from './NetworkController.js'
import { PublicStateController } from './PublicStateController.js'

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

type ChainsInitializerAdapter = Pick<
  ChainAdapter,
  | 'connectionControllerClient'
  | 'networkControllerClient'
  | 'defaultNetwork'
  | 'chainNamespace'
  | 'adapterType'
  | 'caipNetworks'
>

// -- Constants ----------------------------------------- //
const accountState: AccountControllerState = {
  currentTab: 0,
  tokenBalance: [],
  smartAccountDeployed: false,
  addressLabels: new Map(),
  allAccounts: []
}

const networkState: NetworkControllerState = {
  supportsAllNetworks: true,
  smartAccountEnabledNetworks: []
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
  }
})

// -- Controller ---------------------------------------- //
export const ChainController = {
  state,

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

  initialize(adapters: ChainsInitializerAdapter[]) {
    const adapterToActivate = adapters?.[0]

    if (adapters?.length === 0) {
      state.noAdapters = true
    }

    if (!state.noAdapters) {
      state.activeChain = adapterToActivate?.chainNamespace
      PublicStateController.set({ activeChain: adapterToActivate?.chainNamespace })

      adapters.forEach((adapter: ChainsInitializerAdapter) => {
        state.chains.set(adapter.chainNamespace, {
          chainNamespace: adapter.chainNamespace,
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

  initializeUniversalAdapter(
    adapter: ChainsInitializerAdapter,
    adapters: ChainsInitializerAdapter[]
  ) {
    state.universalAdapter = adapter

    if (adapters.length === 0) {
      const storedCaipNetwork = StorageUtil.getStoredActiveCaipNetwork()

      try {
        if (storedCaipNetwork) {
          state.activeChain = storedCaipNetwork.chainNamespace
        } else {
          state.activeChain =
            adapter?.defaultNetwork?.chainNamespace ?? adapter.caipNetworks[0]?.chainNamespace
        }
      } catch (error) {
        console.warn('>>> Error setting active caip network', error)
      }
    }

    const chains = [...new Set(adapter.caipNetworks.map(caipNetwork => caipNetwork.chainNamespace))]
    chains.forEach((chain: ChainNamespace) => {
      state.chains.set(chain, {
        chainNamespace: chain,
        connectionControllerClient: undefined,
        networkControllerClient: undefined,
        adapterType: adapter.adapterType,
        accountState,
        networkState,
        caipNetworks: adapter.caipNetworks
      })
    })
  },

  setChainNetworkData(
    chain: ChainNamespace | undefined,
    props: Partial<NetworkControllerState>,
    replaceState = false
  ) {
    if (!chain) {
      throw new Error('Chain is required to update chain network data')
    }

    const chainAdapter = state.chains.get(chain)

    if (chainAdapter) {
      chainAdapter.networkState = ref({
        ...chainAdapter.networkState,
        ...props
      } as NetworkControllerState)

      state.chains.set(chain, ref(chainAdapter))
      if (replaceState || state.chains.size === 1 || state.activeChain === chain) {
        NetworkController.replaceState(chainAdapter.networkState)
      }
    }
  },

  setChainAccountData(
    chain: ChainNamespace | undefined,
    accountProps: Partial<AccountControllerState>,
    replaceState = true
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
      if (replaceState || state.chains.size === 1 || state.activeChain === chain) {
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
      SafeLocalStorage.setItem(SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID, caipNetwork?.id)
      PublicStateController.set({
        activeChain: chain,
        selectedNetworkId: caipNetwork?.id
      })
    }
  },

  setActiveCaipNetwork(caipNetwork: NetworkControllerState['caipNetwork']) {
    if (!caipNetwork) {
      return
    }

    const newAdapter = state.chains.get(caipNetwork.chainNamespace)
    state.activeChain = caipNetwork.chainNamespace
    state.activeCaipNetwork = caipNetwork
    state.activeCaipAddress = newAdapter?.accountState?.caipAddress

    if (newAdapter) {
      NetworkController.replaceState(newAdapter.networkState)
      AccountController.replaceState(newAdapter.accountState)
    }

    PublicStateController.set({
      activeChain: state.activeChain,
      selectedNetworkId: state.activeCaipNetwork?.id
    })
    SafeLocalStorage.setItem(SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID, caipNetwork.id)
  },

  /**
   * The setCaipNetwork function is being called for different purposes and it needs to be controlled if it should replace the NetworkController state or not.
   * While we initializing the adapters, we need to set the caipNetwork without replacing the state.
   * But when we switch the network, we need to replace the state.
   * @param chain
   * @param caipNetwork
   * @param shouldReplace - if true, it will replace the NetworkController state
   */
  setCaipNetwork(
    chain: ChainNamespace | undefined,
    caipNetwork: NetworkControllerState['caipNetwork'],
    shouldReplace = false
  ) {
    state.activeChain = caipNetwork?.chainNamespace
    state.activeCaipNetwork = caipNetwork
    PublicStateController.set({
      activeChain: state.activeChain,
      selectedNetworkId: state.activeCaipNetwork?.id
    })
    this.setChainNetworkData(chain, { caipNetwork }, shouldReplace)
  },

  setActiveConnector(connector: ChainControllerState['activeConnector']) {
    if (connector) {
      state.activeConnector = ref(connector)
    }
  },

  getNetworkControllerClient(chainNamespace?: ChainNamespace) {
    const walletId = SafeLocalStorage.getItem(SafeLocalStorageKeys.WALLET_ID)
    const chain = chainNamespace || state.activeChain
    const isWcConnector = walletId === 'walletConnect'
    const universalNetworkControllerClient = state.universalAdapter.networkControllerClient

    const shouldUseUniversalAdapter = isWcConnector || state.noAdapters

    if (shouldUseUniversalAdapter) {
      if (!universalNetworkControllerClient) {
        throw new Error("Universal Adapter's networkControllerClient is not set")
      }

      return universalNetworkControllerClient
    }

    if (!chain) {
      throw new Error('Chain is required to get network controller client')
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
    const isWcConnector =
      SafeLocalStorage.getItem(SafeLocalStorageKeys.CONNECTED_CONNECTOR) === 'WALLET_CONNECT'
    const universalConnectionControllerClient = state.universalAdapter.connectionControllerClient
    const hasWagmiAdapter = state.chains.get('eip155')?.adapterType === 'wagmi'

    const shouldUseUniversalAdapter = (isWcConnector && !hasWagmiAdapter) || state.noAdapters

    if (shouldUseUniversalAdapter) {
      if (!universalConnectionControllerClient) {
        throw new Error("Universal Adapter's ConnectionControllerClient is not set")
      }

      return universalConnectionControllerClient
    }

    if (!chain) {
      throw new Error('Chain is required to get connection controller client')
    }

    const chainAdapter = state.chains.get(chain)

    if (!chainAdapter) {
      throw new Error('Chain adapter not found')
    }

    if (!chainAdapter.connectionControllerClient) {
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

  getNetworkProp<K extends keyof NetworkControllerState>(
    key: K,
    _chain?: ChainNamespace
  ): NetworkControllerState[K] | undefined {
    const chain = _chain || state.activeChain

    if (!chain) {
      return undefined
    }

    const chainNetworkState = state.chains.get(chain)?.networkState

    if (!chainNetworkState) {
      return undefined
    }

    return chainNetworkState[key]
  },

  getAllRequestedCaipNetworks(): NetworkControllerState['requestedCaipNetworks'] {
    const requestedCaipNetworks: NetworkControllerState['requestedCaipNetworks'] = []

    state.chains.forEach(chainAdapter => {
      const chainNetworkState = chainAdapter.networkState
      if (chainNetworkState?.requestedCaipNetworks) {
        requestedCaipNetworks.push(...chainNetworkState.requestedCaipNetworks)
      }
    })

    return requestedCaipNetworks
  },

  getAllApprovedCaipNetworks(): NetworkControllerState['approvedCaipNetworkIds'] {
    const approvedCaipNetworkIds: NetworkControllerState['approvedCaipNetworkIds'] = []

    state.chains.forEach(chainAdapter => {
      const chainNetworkState = chainAdapter.networkState
      if (chainNetworkState?.approvedCaipNetworkIds) {
        approvedCaipNetworkIds.push(...chainNetworkState.approvedCaipNetworkIds)
      }
    })

    return approvedCaipNetworkIds
  },

  resetAccount(chain: ChainNamespace | undefined) {
    const chainToWrite = chain

    if (!chainToWrite) {
      throw new Error('Chain is required to set account prop')
    }

    ChainController.state.activeCaipAddress = undefined
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
        provider: undefined
      })
    )
  }
}
