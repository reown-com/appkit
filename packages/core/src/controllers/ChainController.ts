import { proxyMap, subscribeKey as subKey } from 'valtio/utils'
import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import type { ChainAdapter, Connector } from '../utils/TypeUtil.js'

import { NetworkController, type NetworkControllerState } from './NetworkController.js'
import { AccountController, type AccountControllerState } from './AccountController.js'
import { PublicStateController } from './PublicStateController.js'
import { type CaipNetwork, type ChainNamespace } from '@web3modal/common'

// -- Types --------------------------------------------- //
export interface ChainControllerState {
  activeChain: ChainNamespace | undefined
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
>

// -- Constants ----------------------------------------- //
const accountState: AccountControllerState = {
  isConnected: false,
  currentTab: 0,
  tokenBalance: [],
  smartAccountDeployed: false,
  addressLabels: new Map(),
  allAccounts: []
}

const networkState: NetworkControllerState = {
  supportsAllNetworks: true,
  isDefaultCaipNetwork: false,
  smartAccountEnabledNetworks: []
}

// -- State --------------------------------------------- //
const state = proxy<ChainControllerState>({
  chains: proxyMap<ChainNamespace, ChainAdapter>(),
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

  subscribeChain(callback: (value: ChainAdapter | undefined) => void) {
    let prev: ChainAdapter | undefined = undefined

    return sub(state.chains, () => {
      const activeChain = state.activeChain

      if (activeChain) {
        const nextValue = state.chains.get(activeChain)
        if (!prev || prev !== nextValue) {
          prev = nextValue
          callback(nextValue)
        }
      }
    })
  },

  subscribeChainProp<K extends keyof ChainAdapter>(
    property: K,
    callback: (value: ChainAdapter[K] | undefined) => void
  ) {
    let prev: ChainAdapter[K] | undefined = undefined

    return sub(state.chains, () => {
      const activeChain = state.activeChain

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
      this.setActiveCaipNetwork(adapterToActivate?.defaultNetwork)

      adapters.forEach((adapter: ChainsInitializerAdapter) => {
        state.chains.set(adapter.chainNamespace, {
          chainNamespace: adapter.chainNamespace,
          connectionControllerClient: adapter.connectionControllerClient,
          networkControllerClient: adapter.networkControllerClient,
          adapterType: adapter.adapterType,
          accountState,
          networkState
        })
      })
    }
  },

  initializeUniversalAdapter(
    adapter: ChainsInitializerAdapter,
    adapters: ChainsInitializerAdapter[]
  ) {
    state.activeChain = 'eip155'
    PublicStateController.set({ activeChain: 'eip155' })
    state.universalAdapter = adapter

    if (adapters.length === 0) {
      this.setActiveCaipNetwork(adapter?.defaultNetwork)
    }
    const chains: ChainNamespace[] = ['eip155', 'solana']
    chains.forEach((chain: ChainNamespace) => {
      state.chains.set(chain, {
        chainNamespace: chain,
        connectionControllerClient: undefined,
        networkControllerClient: undefined,
        adapterType: adapter.adapterType,
        accountState,
        networkState
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
        AccountController.replaceState(chainAdapter.accountState)
      }
    }
  },

  setAccountProp(
    prop: keyof AccountControllerState,
    value: AccountControllerState[keyof AccountControllerState],
    chain: ChainNamespace | undefined
  ) {
    this.setChainAccountData(chain, {
      [prop]: value
    })
  },

  setActiveChain(chain: ChainNamespace | undefined) {
    const newAdapter = chain ? state.chains.get(chain) : undefined

    if (newAdapter && newAdapter.chainNamespace !== state.activeChain) {
      state.activeChain = newAdapter.chainNamespace
      state.activeCaipNetwork = newAdapter.networkState?.caipNetwork
        ? ref(newAdapter.networkState?.caipNetwork)
        : undefined
      AccountController.replaceState(newAdapter.accountState)
      NetworkController.replaceState(newAdapter.networkState)
      this.setCaipNetwork(newAdapter.chainNamespace, newAdapter.networkState?.caipNetwork, true)
      PublicStateController.set({
        activeChain: chain,
        selectedNetworkId: newAdapter.networkState?.caipNetwork?.id
      })
    }
  },

  setActiveCaipNetwork(caipNetwork: NetworkControllerState['caipNetwork']) {
    if (!caipNetwork) {
      return
    }

    if (caipNetwork.chainNamespace !== state.activeChain) {
      this.setActiveChain(caipNetwork.chainNamespace)
    }

    state.activeCaipNetwork = ref(caipNetwork)
    state.activeChain = caipNetwork.chainNamespace
    this.setCaipNetwork(caipNetwork.chainNamespace, caipNetwork, true)
    PublicStateController.set({
      activeChain: caipNetwork.chainNamespace,
      selectedNetworkId: caipNetwork?.id
    })
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
    this.setChainNetworkData(chain, { caipNetwork }, shouldReplace)
  },

  setActiveConnector(connector: ChainControllerState['activeConnector']) {
    if (connector) {
      state.activeConnector = ref(connector)
    }
  },

  getNetworkControllerClient() {
    const chain = state.activeChain
    const isWcConnector = state.activeConnector?.name === 'WalletConnect'
    const universalNetworkControllerClient = state.universalAdapter.networkControllerClient
    const hasWagmiAdapter = state.chains.get('eip155')?.adapterType === 'wagmi'

    const shouldUseUniversalAdapter = (isWcConnector && !hasWagmiAdapter) || state.noAdapters

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
    const isWcConnector = state.activeConnector?.name === 'WalletConnect'
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

    this.setChainAccountData(
      chainToWrite,
      ref({
        isConnected: false,
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
