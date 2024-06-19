/**
 * Duplicate of the NetworkController from the core package.
 * ChainController is a controller that manages the network state with the capabilities of managing multiple chains/protocols.
 */
import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, subscribe as sub } from 'valtio/vanilla'
import type { CaipNetwork, CaipNetworkId, ChainAdapter } from '../utils/TypeUtil.js'
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
}

type StateKey = keyof ChainControllerState

// -- Constants ----------------------------------------- //
const accountState = {
  isConnected: false,
  currentTab: 0,
  tokenBalance: [],
  smartAccountDeployed: false
}

// -- State --------------------------------------------- //
const state = proxy<ChainControllerState>({
  multiChainEnabled: false,
  chains: {
    evm: {
      connectionControllerClient: undefined,
      networkControllerClient: undefined,
      accountState,
      chain: 'evm'
    },
    solana: {
      connectionControllerClient: undefined,
      networkControllerClient: undefined,
      accountState,
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

  getConnectionControllerClient(chain: Chain) {
    return state.chains[chain].connectionControllerClient
  },

  getNetworkControllerClient(chain: Chain) {
    return state.chains[chain].networkControllerClient
  },

  initialize(adapters: ChainAdapter[]) {
    const firstChainToActivate = adapters?.[0]?.chain || 'evm'

    state.multiChainEnabled = true

    adapters.forEach((adapter: ChainAdapter) => {
      state.chains[adapter.chain].connectionControllerClient = adapter.connectionControllerClient
      state.chains[adapter.chain].networkControllerClient = adapter.networkControllerClient
      state.chains[adapter.chain].accountState = proxy<AccountControllerState>({
        isConnected: false,
        currentTab: 0,
        tokenBalance: [],
        smartAccountDeployed: false
      })
    })

    const networks = this.getRequestedCaipNetworks(firstChainToActivate)
    console.log('>>> initialize', networks)
    this.setCaipNetwork(networks[0])
  },

  getAccountProp(prop: keyof AccountControllerState) {
    if (!this.state.activeChain) {
      console.warn(`>>> Chain is required to get account prop ${prop}`)
      return undefined
    }

    if (state.chains[this.state.activeChain].accountState) {
      return state.chains[this.state.activeChain].accountState[prop]
    }

    return undefined
  },

  setAccountProp(
    prop: keyof AccountControllerState,
    value: AccountControllerState[keyof AccountControllerState],
    chain?: Chain
  ) {
    if (!chain) {
      console.warn(`Chain is required to set account prop ${prop}: ${value}`)
      return
    }

    if (state.chains[chain].accountState) {
      // @ts-ignore
      state.chains[chain].accountState[prop] = value
    }
  },

  resetAccount(chain?: Chain) {
    if (!chain) {
      throw new Error('Chain is required to set account prop')
    }

    state.chains[chain].accountState.isConnected = false
    state.chains[chain].accountState.smartAccountDeployed = false
    state.chains[chain].accountState.currentTab = 0
    state.chains[chain].accountState.caipAddress = undefined
    state.chains[chain].accountState.address = undefined
    state.chains[chain].accountState.balance = undefined
    state.chains[chain].accountState.balanceSymbol = undefined
    state.chains[chain].accountState.profileName = undefined
    state.chains[chain].accountState.profileImage = undefined
    state.chains[chain].accountState.addressExplorerUrl = undefined
    state.chains[chain].accountState.tokenBalance = []
    state.chains[chain].accountState.connectedWalletInfo = undefined
    state.chains[chain].accountState.preferredAccountType = undefined
    state.chains[chain].accountState.socialProvider = undefined
    state.chains[chain].accountState.socialWindow = undefined
  },

  activeNetwork() {
    return state.activeCaipNetwork
  },

  setActiveChain(chain?: Chain) {
    // const allCaipNetworkIds = this.getApprovedCaipNetworkIds()
    // const chainCaipNetworks = allCaipNetworkIds?.filter(network =>network.id === chain)

    if (chain) {
      state.activeChain = chain
      console.log('>>> set active chain to 2', chain)
      PublicStateController.set({ activeChain: chain })
      if (!state.activeCaipNetwork) {
        state.activeCaipNetwork = state.chains[chain].requestedCaipNetworks?.[0]
      }
    }
  },

  setClient(client: NetworkControllerClient, chain: Chain) {
    state.chains[chain]._client = client
  },

  setCaipNetwork(caipNetwork: ChainOptions['caipNetwork']) {
    if (!caipNetwork) {
      throw new Error('caipNetwork is required to set active network')
    }

    console.log('>>> [setCaipNetwork] caipNetwork', caipNetwork)
    state.chains[caipNetwork.chain].caipNetwork = caipNetwork
    state.activeCaipNetwork = caipNetwork
    state.activeChain = caipNetwork.chain
    PublicStateController.set({
      activeChain: caipNetwork.chain,
      selectedNetworkId: caipNetwork?.id
    })
  },

  setDefaultCaipNetwork(caipNetwork: ChainOptions['caipNetwork'], chain: Chain) {
    state.chains[chain].caipNetwork = caipNetwork
    state.chains[chain].isDefaultCaipNetwork = true
    state.activeCaipNetwork = caipNetwork
    state.activeChain = chain
    PublicStateController.set({ activeChain: chain })
  },

  setRequestedCaipNetworks(requestedNetworks: ChainOptions['requestedCaipNetworks'], chain: Chain) {
    state.chains[chain].requestedCaipNetworks = requestedNetworks
  },

  setAllowUnsupportedChain(
    allowUnsupportedChain: NetworkControllerState['allowUnsupportedChain'],
    chain: Chain
  ) {
    state.chains[chain].allowUnsupportedChain = allowUnsupportedChain
  },

  setSmartAccountEnabledNetworks(
    smartAccountEnabledNetworks: NetworkControllerState['smartAccountEnabledNetworks'],
    chain: Chain
  ) {
    state.chains[chain].smartAccountEnabledNetworks = smartAccountEnabledNetworks
  },

  getRequestedCaipNetworks(filteredChain?: Chain) {
    let chainAdapters: ChainAdapter[] | undefined

    if (filteredChain) {
      chainAdapters = [state.chains[filteredChain]]
    } else {
      chainAdapters = Object.values(state.chains)
    }

    const approvedIds: `${string}:${string}`[] = []
    const requestedIds: CaipNetwork[] = []

    chainAdapters.forEach(chain => {
      if (chain.approvedCaipNetworkIds) {
        approvedIds.push(...chain.approvedCaipNetworkIds)
      }
      if (chain.requestedCaipNetworks) {
        requestedIds.push(...chain.requestedCaipNetworks)
      }
    })

    const sortedNetworks = CoreHelperUtil.sortRequestedNetworks(approvedIds, requestedIds)

    return sortedNetworks
  },

  getApprovedCaipNetworkIds(chain?: Chain) {
    if (chain) {
      return state.chains[chain].approvedCaipNetworkIds
    }
    const allCaipNetworkIds: CaipNetworkId[] = []
    Object.values(state.chains).forEach(chain => {
      if (chain.approvedCaipNetworkIds) {
        allCaipNetworkIds.push(...chain.approvedCaipNetworkIds)
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
    chain: Chain
  ) {
    state.chains[chain].approvedCaipNetworkIds = data?.approvedCaipNetworkIds
    state.chains[chain].supportsAllNetworks = data?.supportsAllNetworks
  },

  async switchActiveNetwork(network: NetworkControllerState['caipNetwork']) {
    console.log('>>> switch network3', network)
    if (!network) {
      throw new Error('Network is required to switch active network')
    }

    // TODO(enes): Add logic to switch chain
    state.chains[network.chain].caipNetwork = network
    state.activeCaipNetwork = network
    state.activeChain = network.chain
    PublicStateController.set({ activeChain: network.chain })
  },

  switchChain(newChain: Chain) {
    state.activeChain = newChain
    console.log('>>> set active chain to 5', newChain)
    this.setCaipNetwork(state.chains[newChain].caipNetwork)
    PublicStateController.set({ activeChain: newChain })
  },

  checkIfSupportedNetwork(activeCaipNetworkId: CaipNetworkId | undefined) {
    const activeChain = state.activeChain
    if (!activeChain) {
      return false
    }

    const requestedCaipNetworks = this.getRequestedCaipNetworks()
    return requestedCaipNetworks?.some(network => network.id === activeCaipNetworkId) ? false : true
  },

  resetNetwork(chain: Chain) {
    state.chains[chain].approvedCaipNetworkIds = undefined
    state.chains[chain].supportsAllNetworks = true
    state.chains[chain].smartAccountEnabledNetworks = []
  },

  showUnsupportedChainUI() {
    setTimeout(() => {
      ModalController.open({ view: 'UnsupportedChain' })
    }, 300)
  },

  getSupportsAllNetworks() {
    if (!state.activeChain) {
      return false
    }

    return state.chains[state.activeChain as Chain]?.supportsAllNetworks
  }
}
