/**
 * Duplicate of the NetworkController from the core package.
 * ChainController is a controller that manages the network state with the capabilities of managing multiple chains/protocols.
 */
import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import type { CaipNetwork, CaipNetworkId, ChainAdapter, Connector } from '../utils/TypeUtil.js'
import { ModalController } from './ModalController.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { type NetworkControllerClient, type NetworkControllerState } from './NetworkController.js'
import { type AccountControllerState } from './AccountController.js'
import { PublicStateController } from './PublicStateController.js'

// -- Types --------------------------------------------- //
export type Chain = 'evm' | 'solana'

export type ChainOptions = {
  requestedCaipNetworks?: CaipNetwork[]
  approvedCaipNetworkIds?: CaipNetworkId[]
  caipNetwork?: CaipNetwork
  defaultCaipNetwork?: CaipNetwork
}

export interface ChainControllerState {
  multiChainEnabled: boolean
  activeChain: 'evm' | 'solana' | undefined
  activeCaipNetwork?: CaipNetwork
  chains: Record<Chain, ChainAdapter>
  activeConnector?: Connector
}

type StateKey = keyof ChainControllerState

// -- Constants ----------------------------------------- //
const accountState = {
  isConnected: false,
  currentTab: 0,
  tokenBalance: [],
  smartAccountDeployed: false
}

const networkState = {
  supportsAllNetworks: true,
  isDefaultCaipNetwork: false,
  smartAccountEnabledNetworks: []
}

// -- State --------------------------------------------- //
const state = proxy<ChainControllerState>({
  multiChainEnabled: false,
  chains: {
    evm: {
      connectionControllerClient: undefined,
      networkControllerClient: undefined,
      accountState,
      networkState,
      chain: 'evm'
    },
    solana: {
      connectionControllerClient: undefined,
      networkControllerClient: undefined,
      accountState,
      networkState,
      chain: 'solana'
    }
  },
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

  getConnectionControllerClient() {
    if (!state.activeChain) {
      throw new Error('Chain is required to get connection controller client')
    }

    return state.chains[state.activeChain].connectionControllerClient
  },

  getNetworkControllerClient() {
    const chainToWrite = state.multiChainEnabled ? state.activeChain : 'evm'

    if (!chainToWrite) {
      throw new Error('Chain is required to get network controller client')
    }

    return state.chains[chainToWrite].networkControllerClient
  },

  setMultiChainEnabled(multiChain: boolean) {
    state.multiChainEnabled = multiChain
  },

  initialize(adapters: ChainAdapter[]) {
    const firstChainToActivate = adapters?.[0]?.chain || 'evm'

    state.activeChain = firstChainToActivate

    adapters.forEach((adapter: ChainAdapter) => {
      state.chains[adapter.chain].connectionControllerClient = adapter.connectionControllerClient
      state.chains[adapter.chain].networkControllerClient = adapter.networkControllerClient
      state.chains[adapter.chain].accountState = accountState
      state.chains[adapter.chain].networkState = networkState
    })
  },

  initializeDefaultNetwork() {
    const networks = this.getRequestedCaipNetworks()

    if (networks.length > 0) {
      this.setCaipNetwork(networks[0])
    }
  },

  getAccountProp(prop: keyof AccountControllerState) {
    const chainToWrite = state.multiChainEnabled ? state.activeChain : 'evm'

    if (!chainToWrite) {
      return undefined
    }

    if (state.chains[chainToWrite].accountState) {
      return state.chains[chainToWrite].accountState[prop]
    }

    return undefined
  },

  getNetworkProp(prop: keyof NetworkControllerState) {
    const chainToWrite = state.multiChainEnabled ? state.activeChain : 'evm'

    if (!chainToWrite) {
      return undefined
    }

    if (state.chains[chainToWrite].networkState) {
      return state.chains[chainToWrite].networkState[prop]
    }

    return undefined
  },

  setAccountProp(
    prop: keyof AccountControllerState,
    value: AccountControllerState[keyof AccountControllerState],
    chain?: Chain
  ) {
    const chainToWrite = state.multiChainEnabled ? chain : 'evm'

    if (!chainToWrite) {
      console.warn(`Chain is required to set account prop ${prop}: ${value}`)
      return
    }

    if (state.chains[chainToWrite].accountState) {
      // @ts-ignore
      state.chains[chainToWrite].accountState[prop] = value
    }
  },

  seNetworkProp(
    prop: keyof AccountControllerState,
    value: NetworkControllerState[keyof NetworkControllerState],
    chain?: Chain
  ) {
    const chainToWrite = state.multiChainEnabled ? chain : 'evm'

    if (!chainToWrite) {
      console.warn(`Chain is required to set account prop ${prop}: ${value}`)
      return
    }

    if (state.chains[chainToWrite].networkState) {
      // @ts-ignore
      state.chains[chainToWrite].networkState[prop] = value
    }
  },

  resetAccount(chain?: Chain) {
    const chainToWrite = state.multiChainEnabled ? chain : 'evm'

    if (!chainToWrite) {
      throw new Error('Chain is required to set account prop')
    }

    state.chains[chainToWrite].accountState = {
      ...state.chains[chainToWrite].accountState,
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
    }
  },

  activeNetwork() {
    if (state.multiChainEnabled) {
      return state.activeCaipNetwork
    }

    return state.chains['evm'].networkState.caipNetwork
  },

  setActiveChain(chain?: Chain) {
    // const allCaipNetworkIds = this.getApprovedCaipNetworkIds()
    // const chainCaipNetworks = allCaipNetworkIds?.filter(network =>network.id === chain)

    if (chain) {
      state.activeChain = chain
      PublicStateController.set({ activeChain: chain })
      if (!state.activeCaipNetwork) {
        state.activeCaipNetwork = state.chains[chain].networkState.requestedCaipNetworks?.[0]
      }
    }
  },

  setClient(client: NetworkControllerClient, chain?: Chain) {
    const chainToWrite = state.multiChainEnabled ? chain : 'evm'

    if (!chainToWrite) {
      throw new Error('chainToWrite is required to set default network')
    }

    state.chains[chainToWrite].networkState = {
      ...state.chains[chainToWrite].networkState,
      _client: client
    }
  },

  setCaipNetwork(caipNetwork: ChainOptions['caipNetwork']) {
    const chainToWrite = 'evm'

    if (!chainToWrite) {
      throw new Error('chainToWrite is required to set default network')
    }

    if (!caipNetwork) {
      throw new Error('caipNetwork is required to set active network')
    }

    state.chains[chainToWrite].networkState = {
      ...state.chains[chainToWrite].networkState,
      caipNetwork
    }
    state.activeCaipNetwork = caipNetwork
    state.activeChain = chainToWrite

    PublicStateController.set({
      activeChain: chainToWrite,
      selectedNetworkId: caipNetwork?.id
    })

    if (!state.chains[chainToWrite].networkState.allowUnsupportedChain) {
      this.checkIfSupportedNetwork()
    }
  },

  setDefaultCaipNetwork(caipNetwork: ChainOptions['caipNetwork'], chain?: Chain) {
    const chainToWrite = state.multiChainEnabled ? chain : 'evm'

    if (!chainToWrite) {
      throw new Error('chainToWrite is required to set default network')
    }

    state.chains[chainToWrite].networkState = {
      ...state.chains[chainToWrite].networkState,
      caipNetwork,
      isDefaultCaipNetwork: true
    }
    state.activeCaipNetwork = caipNetwork
    state.activeChain = chainToWrite
    PublicStateController.set({ selectedNetworkId: caipNetwork?.id, activeChain: chainToWrite })
  },

  setActiveConnector(connector: ChainControllerState['activeConnector']) {
    if (connector) {
      state.activeConnector = ref(connector)
    }
  },

  setAllowUnsupportedChain(
    allowUnsupportedChain: NetworkControllerState['allowUnsupportedChain'],
    chain?: Chain
  ) {
    // TODO(enes): Specifically to this we are setting this option only for the EVM chain
    const chainToWrite = chain || 'evm'

    state.chains[chainToWrite].networkState = {
      ...state.chains[chainToWrite].networkState,
      allowUnsupportedChain
    }
  },

  setSmartAccountEnabledNetworks(
    smartAccountEnabledNetworks: NetworkControllerState['smartAccountEnabledNetworks'],
    chain?: Chain
  ) {
    const chainToWrite = state.multiChainEnabled ? chain : 'evm'

    if (!chainToWrite) {
      throw new Error('chainToWrite is required to set default network')
    }

    state.chains[chainToWrite].networkState.smartAccountEnabledNetworks =
      smartAccountEnabledNetworks
  },

  setRequestedCaipNetworks(
    requestedNetworks: ChainOptions['requestedCaipNetworks'],
    chain?: Chain
  ) {
    const chainToWrite = state.multiChainEnabled ? chain : 'evm'

    if (!chainToWrite) {
      throw new Error('chainToWrite is required to set default network')
    }

    state.chains[chainToWrite].networkState = {
      ...state.chains[chainToWrite].networkState,
      requestedCaipNetworks: requestedNetworks
    }
  },

  getRequestedCaipNetworks(filteredChain?: Chain) {
    let chainAdapters: Chain[] | undefined

    if (filteredChain) {
      let chainToWrite = state.multiChainEnabled ? filteredChain : 'evm'

      if (!chainToWrite) {
        throw new Error('chainToWrite is required to set default network')
      }

      chainAdapters = [chainToWrite]
    } else {
      if (state.multiChainEnabled) {
        chainAdapters = Object.keys(state.chains) as Chain[]
      } else {
        chainAdapters = ['evm']
      }
    }

    const approvedIds: `${string}:${string}`[] = []
    const requestedNetworks: CaipNetwork[] = []

    chainAdapters.forEach((chn: Chain) => {
      if (state.chains[chn].networkState.approvedCaipNetworkIds) {
        approvedIds.push(...(state.chains[chn].networkState?.approvedCaipNetworkIds || []))
      }
      if (state.chains[chn].networkState.requestedCaipNetworks) {
        requestedNetworks.push(...(state.chains[chn].networkState?.requestedCaipNetworks || []))
      }
    })

    const sortedNetworks = CoreHelperUtil.sortRequestedNetworks(approvedIds, requestedNetworks)

    return sortedNetworks
  },

  getApprovedCaipNetworkIds(chain?: Chain) {
    // If user specifies a chain, return the approved networks for that chain
    if (chain) {
      let chainToWrite = state.multiChainEnabled ? chain : 'evm'

      if (!chainToWrite) {
        throw new Error('chainToWrite is required to set default network')
      }

      return state.chains[chain].networkState.approvedCaipNetworkIds
    }

    // Otherwise, return all approved networks
    const allCaipNetworkIds: CaipNetworkId[] = []

    Object.values(state.chains).forEach(adapter => {
      if (adapter.networkState.approvedCaipNetworkIds) {
        allCaipNetworkIds.push(...(adapter.networkState?.approvedCaipNetworkIds || []))
      }
    })

    return allCaipNetworkIds
  },

  async setApprovedCaipNetworksData(
    data:
      | {
          approvedCaipNetworkIds: `${string}:${string}`[] | undefined
          supportsAllNetworks: boolean
        }
      | undefined,
    chain?: Chain
  ) {
    let chainToWrite = state.multiChainEnabled ? chain : 'evm'

    if (!chainToWrite) {
      throw new Error('chainToWrite is required to set default network')
    }

    state.chains[chainToWrite].networkState = {
      ...state.chains[chainToWrite].networkState,
      approvedCaipNetworkIds: data?.approvedCaipNetworkIds,
      supportsAllNetworks: data?.supportsAllNetworks || false
    }
  },

  async switchActiveNetwork(network: NetworkControllerState['caipNetwork']) {
    let chainToWrite = state.multiChainEnabled ? network?.chain : 'evm'

    if (!chainToWrite) {
      throw new Error('chainToWrite is required to set default network')
    }

    if (!network) {
      throw new Error('Network is required to switch active network')
    }

    state.chains[chainToWrite].networkState = {
      ...state.chains[chainToWrite].networkState,
      caipNetwork: network
    }
    state.activeCaipNetwork = network
    state.activeChain = chainToWrite
    PublicStateController.set({ activeChain: chainToWrite, selectedNetworkId: network.id })
  },

  switchChain(newChain: Chain) {
    state.activeChain = newChain
    this.setCaipNetwork(state.chains[newChain].caipNetwork)
    PublicStateController.set({ activeChain: newChain })
  },

  checkIfSupportedNetwork() {
    const chainToWrite = state.multiChainEnabled ? state.activeChain : 'evm'

    if (!chainToWrite) {
      return false
    }

    const activeCaipNetwork = state.chains[chainToWrite].networkState.caipNetwork

    const requestedCaipNetworks = this.getRequestedCaipNetworks()

    return requestedCaipNetworks?.some(network => network.id === activeCaipNetwork?.id)
      ? false
      : true
  },

  resetNetwork() {
    const chainToWrite = state.multiChainEnabled ? state.activeChain : 'evm'

    if (!chainToWrite) {
      throw new Error('chainToWrite is required to set default network')
    }

    if (!state.chains[chainToWrite].networkState.isDefaultCaipNetwork) {
      state.chains[chainToWrite].networkState = {
        ...state.chains[chainToWrite].networkState,
        caipNetwork: undefined
      }
    }

    state.chains[chainToWrite].networkState = {
      ...state.chains[chainToWrite].networkState,
      approvedCaipNetworkIds: undefined,
      supportsAllNetworks: true,
      smartAccountEnabledNetworks: []
    }
  },

  showUnsupportedChainUI() {
    setTimeout(() => {
      ModalController.open({ view: 'UnsupportedChain' })
    }, 300)
  },

  getSupportsAllNetworks() {
    const chainToWrite = state.multiChainEnabled ? state.activeChain : 'evm'

    if (!chainToWrite) {
      throw new Error('chainToWrite is required to set default network')
    }

    return state.chains[chainToWrite].networkState.supportsAllNetworks
  }
}
