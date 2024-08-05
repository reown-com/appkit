import { proxyMap, subscribeKey as subKey } from 'valtio/utils'
import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import type { CaipNetwork, ChainAdapter, Connector } from '../utils/TypeUtil.js'

import { NetworkController, type NetworkControllerState } from './NetworkController.js'
import { AccountController, type AccountControllerState } from './AccountController.js'
import { PublicStateController } from './PublicStateController.js'
import { type Chain } from '@web3modal/common'

// -- Types --------------------------------------------- //
export interface ChainControllerState {
  multiChainEnabled: boolean
  activeChain: Chain | undefined
  activeCaipNetwork?: CaipNetwork
  chains: Map<Chain, ChainAdapter>
  /**
   * {
   *  "evm": {
   *   accountState: {..}
   *  },
   * "solana": {
   *  accountState: {..}
   * }
   */
  activeConnector?: Connector
  universalAdapter?: ChainAdapter
  isUniversalAdapterOnly: boolean
}

type ChainControllerStateKey = keyof ChainControllerState

type ChainsInitializerAdapter = Pick<
  ChainAdapter,
  'connectionControllerClient' | 'networkControllerClient' | 'chain' | 'defaultChain'
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
  multiChainEnabled: false,
  chains: proxyMap<Chain, ChainAdapter>(),
  activeChain: undefined,
  activeCaipNetwork: undefined,
  isUniversalAdapterOnly: false
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

    if (!adapterToActivate) {
      throw new Error('Adapter is required to initialize ChainController')
    }

    state.activeChain = adapterToActivate.chain
    PublicStateController.set({ activeChain: adapterToActivate.chain })
    this.setActiveCaipNetwork(adapterToActivate.defaultChain)

    adapters.forEach((adapter: ChainsInitializerAdapter) => {
      state.chains.set(adapter.chain, {
        chain: adapter.chain,
        connectionControllerClient: adapter.connectionControllerClient,
        networkControllerClient: adapter.networkControllerClient,
        accountState,
        networkState
      })
    })
  },

  initializeUniversalAdapter(adapter: ChainsInitializerAdapter) {
    state.activeChain = 'evm'
    PublicStateController.set({ activeChain: 'evm' })
    state.universalAdapter = adapter
    // this.setActiveCaipNetwork("eip155:1")

    const chains: Chain[] = ['evm', 'solana']
    chains.forEach((chain: Chain) => {
      state.chains.set(chain, {
        chain: chain,
        connectionControllerClient: undefined,
        networkControllerClient: undefined,
        accountState,
        networkState
      })
    })
  },

  setMultiChainEnabled(multiChain: boolean) {
    state.multiChainEnabled = multiChain
  },

  setisUniversalAdapterOnly(isUniversalAdapterOnly: boolean) {
    state.isUniversalAdapterOnly = isUniversalAdapterOnly
  },

  setChainNetworkData(
    chain: Chain | undefined,
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
    chain: Chain | undefined,
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
    chain?: Chain
  ) {
    this.setChainAccountData(state.multiChainEnabled ? chain : state.activeChain, {
      [prop]: value
    })
  },

  setActiveChain(chain?: Chain) {
    const newAdapter = chain ? state.chains.get(chain) : undefined

    if (newAdapter && newAdapter.chain !== state.activeChain) {
      state.activeChain = newAdapter.chain
      state.activeCaipNetwork = newAdapter.networkState?.caipNetwork
        ? ref(newAdapter.networkState?.caipNetwork)
        : undefined
      AccountController.replaceState(newAdapter.accountState)
      NetworkController.replaceState(newAdapter.networkState)
      this.setCaipNetwork(newAdapter.chain, newAdapter.networkState?.caipNetwork)
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

    if (caipNetwork.chain !== state.activeChain) {
      this.setActiveChain(caipNetwork.chain)
    }

    state.activeCaipNetwork = ref(caipNetwork)
    state.activeChain = caipNetwork.chain
    this.setCaipNetwork(caipNetwork.chain, caipNetwork, true)
    PublicStateController.set({
      activeChain: caipNetwork.chain,
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
    chain: Chain,
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
    const isUniversalAdapterOnly = state.isUniversalAdapterOnly

    if (isUniversalAdapterOnly) {
      return state.universalAdapter?.networkControllerClient
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

  getConnectionControllerClient(_chain?: Chain) {
    const chain = _chain || state.activeChain
    const isUniversalAdapterOnly = state.isUniversalAdapterOnly

    if (isUniversalAdapterOnly) {
      return state.universalAdapter?.connectionControllerClient
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
    _chain?: Chain
  ): AccountControllerState[K] | undefined {
    let chain = state.multiChainEnabled ? state.activeChain : state.activeChain

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
    _chain?: Chain
  ): NetworkControllerState[K] | undefined {
    const chain = _chain || state.multiChainEnabled ? state.activeChain : state.activeChain

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

  resetAccount(chain?: Chain) {
    const chainToWrite = state.multiChainEnabled ? chain : state.activeChain

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
        farcasterUrl: undefined
      })
    )
  }
}
