import { proxyMap, subscribeKey as subKey } from 'valtio/utils'
import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import type { CaipNetwork, ChainAdapter, Connector } from '../utils/TypeUtil.js'

import { NetworkController, type NetworkControllerState } from './NetworkController.js'
import { AccountController, type AccountControllerState } from './AccountController.js'
import { PublicStateController } from './PublicStateController.js'
import { ConstantsUtil, type Chain } from '@web3modal/common'

// -- Types --------------------------------------------- //
export interface ChainControllerState {
  multiChainEnabled: boolean
  activeChain: Chain | undefined
  activeCaipNetwork?: CaipNetwork
  chains: Map<Chain, ChainAdapter>
  activeConnector?: Connector
}

type ChainControllerStateKey = keyof ChainControllerState

type ChainsInitializerAdapter = Pick<
  ChainAdapter,
  'connectionControllerClient' | 'networkControllerClient' | 'chain'
>

// -- Constants ----------------------------------------- //
const accountState: AccountControllerState = {
  isConnected: false,
  currentTab: 0,
  tokenBalance: [],
  smartAccountDeployed: false
}

const networkState: NetworkControllerState = {
  supportsAllNetworks: true,
  isDefaultCaipNetwork: false,
  smartAccountEnabledNetworks: []
}

const defaultChainAdapterEVM: ChainAdapter = {
  connectionControllerClient: undefined,
  networkControllerClient: undefined,
  accountState,
  networkState,
  chain: ConstantsUtil.CHAIN.EVM
}

const defaultChainAdapterSolana: ChainAdapter = {
  connectionControllerClient: undefined,
  networkControllerClient: undefined,
  accountState,
  networkState,
  chain: ConstantsUtil.CHAIN.SOLANA
}

// -- State --------------------------------------------- //
const evmKey = defaultChainAdapterEVM
const solana = defaultChainAdapterSolana

const state = proxy<ChainControllerState>({
  multiChainEnabled: false,
  chains: proxyMap<Chain, ChainAdapter>([
    [ConstantsUtil.CHAIN.EVM, evmKey],
    [ConstantsUtil.CHAIN.SOLANA, solana]
  ]),
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
    let prev: ChainAdapter | undefined
    const activeChain = state.activeChain || ConstantsUtil.CHAIN.EVM
    return sub(state.chains, () => {
      const nextValue = state.chains.get(activeChain)
      if (!prev || prev !== nextValue) {
        prev = nextValue
        callback(nextValue)
      }
    })
  },

  subscribeChainProp<K extends keyof ChainAdapter>(
    property: K,
    callback: (value: ChainAdapter[K] | undefined) => void
  ) {
    let prev: ChainAdapter[K] | undefined
    const activeChain = state.activeChain || ConstantsUtil.CHAIN.EVM
    return sub(state.chains, () => {
      const nextValue = state.chains.get(activeChain)?.[property]
      if (prev !== nextValue) {
        prev = nextValue
        callback(nextValue)
      }
    })
  },

  initialize(adapters: ChainsInitializerAdapter[]) {
    const firstChainToActivate = adapters?.[0]?.chain || ConstantsUtil.CHAIN.EVM

    state.activeChain = firstChainToActivate

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

  setMultiChainEnabled(multiChain: boolean) {
    state.multiChainEnabled = multiChain
  },

  setChainNetworkData(chain: Chain | undefined, props: Partial<NetworkControllerState>) {
    if (!chain) {
      throw new Error('Chain is required to update chain network data')
    }

    const chainAdapter = state.chains.get(chain)

    if (chainAdapter) {
      chainAdapter.networkState = { ...chainAdapter.networkState, ...props }
      state.chains.set(chain, chainAdapter)
      NetworkController.replaceState(chainAdapter.networkState)
    }
  },

  setChainAccountData(chain: Chain | undefined, accountProps: Partial<AccountControllerState>) {
    if (!chain) {
      throw new Error('Chain is required to update chain network data')
    }

    const chainAdapter = state.chains.get(chain)

    if (chainAdapter) {
      chainAdapter.accountState = { ...chainAdapter.accountState, ...accountProps }
      state.chains.set(chain, chainAdapter)
      AccountController.replaceState(chainAdapter.accountState)
    }
  },

  setAccountProp(
    prop: keyof AccountControllerState,
    value: AccountControllerState[keyof AccountControllerState],
    chain?: Chain
  ) {
    this.setChainAccountData(state.multiChainEnabled ? chain : ConstantsUtil.CHAIN.EVM, {
      [prop]: value
    })
  },

  setActiveChain(_chain?: Chain) {
    if (_chain) {
      state.activeChain = _chain
      PublicStateController.set({ activeChain: _chain })
      if (!state.activeCaipNetwork) {
        state.activeCaipNetwork = state.chains.get(_chain)?.networkState.requestedCaipNetworks?.[0]
      }
    }
  },

  setActiveConnector(connector: ChainControllerState['activeConnector']) {
    if (connector) {
      state.activeConnector = ref(connector)
    }
  },

  getNetworkControllerClient() {
    const chain = state.multiChainEnabled ? state.activeChain : ConstantsUtil.CHAIN.EVM

    if (!chain) {
      throw new Error('Chain is required to get network controller client')
    }

    const chainAdapter = state.chains.get(chain)

    if (!chainAdapter) {
      throw new Error('Chain adapter not found')
    }

    if (!chainAdapter.networkControllerClient) {
      throw new Error('Network controller client not found')
    }

    return chainAdapter.networkControllerClient
  },

  getConnectionControllerClient() {
    if (!state.activeChain) {
      throw new Error('Chain is required to get connection controller client')
    }

    return state.chains.get(state.activeChain)?.connectionControllerClient
  },

  getAccountProp<K extends keyof AccountControllerState>(
    key: K
  ): AccountControllerState[K] | undefined {
    const chainToWrite = state.multiChainEnabled ? state.activeChain : ConstantsUtil.CHAIN.EVM

    if (!chainToWrite) {
      return undefined
    }

    const accountState = state.chains.get(chainToWrite)?.accountState

    if (!accountState) {
      return undefined
    }

    return accountState[key]
  },

  getNetworkProp<K extends keyof NetworkControllerState>(
    key: K
  ): NetworkControllerState[K] | undefined {
    const chainToWrite = state.multiChainEnabled ? state.activeChain : ConstantsUtil.CHAIN.EVM

    if (!chainToWrite) {
      return undefined
    }

    const networkState = state.chains.get(chainToWrite)?.networkState

    if (!networkState) {
      return undefined
    }

    return networkState[key]
  },

  resetAccount(chain?: Chain) {
    const chainToWrite = state.multiChainEnabled ? chain : ConstantsUtil.CHAIN.EVM

    if (!chainToWrite) {
      throw new Error('Chain is required to set account prop')
    }

    this.setChainAccountData(chainToWrite, {
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
      socialWindow: undefined
    })
  }
}
