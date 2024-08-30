import { proxyMap, subscribeKey as subKey } from 'valtio/utils'
import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import type { CaipNetwork, ChainAdapter, Connector } from '../utils/TypeUtil.js'

import { type Chain } from '@web3modal/common'
import { AccountController, type AccountControllerState } from './AccountController.js'
import { NetworkController, type NetworkControllerState } from './NetworkController.js'
import { PublicStateController } from './PublicStateController.js'

// -- Types --------------------------------------------- //
export interface ChainControllerState {
  activeChain: Chain | undefined
  activeCaipNetwork?: CaipNetwork
  chains: Map<Chain, ChainAdapter>
  activeConnector?: Connector
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
  chains: proxyMap<Chain, ChainAdapter>(),
  activeChain: undefined,
  activeCaipNetwork: undefined
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
    this.setChainAccountData(chain, {
      [prop]: value
    })
  },

  setActiveChain(chain: Chain | undefined) {
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
    key: K
  ): NetworkControllerState[K] | undefined {
    const chainToWrite = state.activeChain

    if (!chainToWrite) {
      return undefined
    }

    const chainNetworkState = state.chains.get(chainToWrite)?.networkState

    if (!chainNetworkState) {
      return undefined
    }

    return chainNetworkState[key]
  },

  resetAccount(chain: Chain | undefined) {
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
        farcasterUrl: undefined
      })
    )
  }
}
