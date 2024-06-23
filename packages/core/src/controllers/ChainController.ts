import { proxyMap, subscribeKey as subKey } from 'valtio/utils'
import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import type { CaipNetwork, CaipNetworkId, ChainAdapter, Connector } from '../utils/TypeUtil.js'

import { NetworkController, type NetworkControllerState } from './NetworkController.js'
import { AccountController, type AccountControllerState } from './AccountController.js'
import { PublicStateController } from './PublicStateController.js'
import { type Chain } from '@web3modal/common'

// -- Types --------------------------------------------- //

export type ChainOptions = {
  requestedCaipNetworks?: CaipNetwork[]
  approvedCaipNetworkIds?: CaipNetworkId[]
  caipNetwork?: CaipNetwork
  defaultCaipNetwork?: CaipNetwork
}

export interface ChainControllerState {
  multiChainEnabled: boolean
  activeChain: Chain | undefined
  activeCaipNetwork?: CaipNetwork
  chains: Map<Chain, ChainAdapter>
  activeConnector?: Connector
}

type StateKey = keyof ChainControllerState

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
  chain: 'evm'
}

const defaultChainAdapterSolana: ChainAdapter = {
  connectionControllerClient: undefined,
  networkControllerClient: undefined,
  accountState,
  networkState,
  chain: 'solana'
}

// -- State --------------------------------------------- //
const evmKey = defaultChainAdapterEVM
const solana = defaultChainAdapterSolana

const state = proxy<ChainControllerState>({
  multiChainEnabled: false,
  chains: proxyMap<Chain, ChainAdapter>([
    ['evm', evmKey],
    ['solana', solana]
  ]),
  activeChain: undefined,
  activeCaipNetwork: undefined
})

// -- Controller ---------------------------------------- //
export const ChainController = {
  state,

  subscribe(callback: (newState: ChainControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: ChainControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  subscribeChain(callback: (value: ChainAdapter | undefined) => void) {
    let prev: ChainAdapter | undefined
    const activeChain = state.activeChain || 'evm'
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
    const activeChain = state.activeChain || 'evm'
    return sub(state.chains, () => {
      const nextValue = state.chains.get(activeChain)?.[property]
      if (prev !== nextValue) {
        prev = nextValue
        callback(nextValue)
      }
    })
  },

  getConnectionControllerClient() {
    if (!state.activeChain) {
      throw new Error('Chain is required to get connection controller client')
    }

    return state.chains.get(state.activeChain)?.connectionControllerClient
  },

  setMultiChainEnabled(multiChain: boolean) {
    state.multiChainEnabled = multiChain
  },

  updateChainNetworkData(chain: Chain | undefined, props: Partial<NetworkControllerState>) {
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

  updateChainAccountData(chain: Chain | undefined, accountProps: Partial<AccountControllerState>) {
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

  getNetworkControllerClient() {
    const chain = state.multiChainEnabled ? state.activeChain : 'evm'

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

  initialize(adapters: ChainAdapter[]) {
    const firstChainToActivate = adapters?.[0]?.chain || 'evm'

    state.activeChain = firstChainToActivate

    adapters.forEach((adapter: ChainAdapter) => {
      state.chains.set(adapter.chain, {
        chain: adapter.chain,
        connectionControllerClient: adapter.connectionControllerClient,
        networkControllerClient: adapter.networkControllerClient,
        accountState,
        networkState
      })
    })
  },

  getAccountProp<K extends keyof AccountControllerState>(
    key: K
  ): AccountControllerState[K] | undefined {
    const chainToWrite = state.multiChainEnabled ? state.activeChain : 'evm'

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
    const chainToWrite = state.multiChainEnabled ? state.activeChain : 'evm'

    if (!chainToWrite) {
      return undefined
    }

    const networkState = state.chains.get(chainToWrite)?.networkState

    if (!networkState) {
      return undefined
    }

    return networkState[key]
  },

  setAccountProp(
    prop: keyof AccountControllerState,
    value: AccountControllerState[keyof AccountControllerState],
    chain?: Chain
  ) {
    this.updateChainAccountData(state.multiChainEnabled ? chain : 'evm', { [prop]: value })
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

  // -- AccountController methods ----------------------- //
  resetAccount(chain?: Chain) {
    const chainToWrite = state.multiChainEnabled ? chain : 'evm'

    if (!chainToWrite) {
      throw new Error('Chain is required to set account prop')
    }

    this.updateChainAccountData(chainToWrite, {
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
