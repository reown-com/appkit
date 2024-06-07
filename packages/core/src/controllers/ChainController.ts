/**
 * Duplicate of the NetworkController from the core package.
 * ChainController is a controller that manages the network state with the capabilities of managing multiple chains/protocols.
 */
import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, subscribe as sub } from 'valtio/vanilla'
import type { AdapterCore, CaipNetwork, CaipNetworkId } from '../utils/TypeUtil.js'
import { ModalController } from './ModalController.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { ConnectionController, type ConnectionControllerClient } from './ConnectionController.js'
import {
  NetworkController,
  type NetworkControllerClient,
  type NetworkControllerState
} from './NetworkController.js'

// -- Types --------------------------------------------- //
export type Chain = 'evm' | 'solana'

export type ChainOptions = {
  requestedCaipNetworks?: CaipNetwork[]
  approvedCaipNetworkIds?: CaipNetworkId[]
  caipNetwork?: CaipNetwork
  defaultCaipNetwork?: CaipNetwork
}

type ChainProps = Partial<NetworkControllerState> & {
  connectionControllerClient?: ConnectionControllerClient
  networkControllerClient?: NetworkControllerClient
}

export interface ChainControllerState {
  availableChains: any
  activeChain: any
  activeCaipNetwork: any
  activeAdapter: any
  adapters: any[]
  chains: Record<Chain, ChainProps>
}

type StateKey = keyof ChainControllerState

// -- State --------------------------------------------- //
const state = proxy<ChainControllerState>({
  chains: {
    evm: {},
    solana: {}
  },
  activeAdapter: undefined,
  availableChains: undefined,
  activeChain: undefined,
  activeCaipNetwork: undefined,
  adapters: []
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

  setAdapters(adapters: any) {
    state.adapters = adapters
    adapters.forEach((adapter: AdapterCore) => {
      state.chains[adapter.protocol].connectionControllerClient = adapter.connectionControllerClient
      state.chains[adapter.protocol].networkControllerClient = adapter.networkControllerClient
    })
  },

  setAdapter(adapter: AdapterCore) {
    state.activeChain = adapter.protocol
    state.activeAdapter = adapter

    // Update controller clients
    const { connectionControllerClient, networkControllerClient } = adapter

    state.chains[adapter.protocol].connectionControllerClient = connectionControllerClient
    state.chains[adapter.protocol].networkControllerClient = networkControllerClient

    // TODO(enes): get rid of these
    if (connectionControllerClient) {
      ConnectionController.setClient(connectionControllerClient)
    }
    if (networkControllerClient) {
      NetworkController.setClient(networkControllerClient)
    }
  },

  activeNetwork() {
    return state.activeCaipNetwork
  },

  setActiveChain(chain?: Chain) {
    if (chain) {
      state.activeChain = chain
    }
  },

  setClient(client: NetworkControllerClient, chain: Chain) {
    state.chains[chain]._client = client
  },

  setCaipNetwork(caipNetwork: ChainOptions['caipNetwork'], chain: Chain) {
    state.chains[chain].caipNetwork = caipNetwork
    state.activeCaipNetwork = caipNetwork
    state.activeChain = chain
  },

  setDefaultCaipNetwork(caipNetwork: ChainOptions['caipNetwork'], chain: Chain) {
    state.chains[chain].caipNetwork = caipNetwork
    state.chains[chain].isDefaultCaipNetwork = true
    state.activeCaipNetwork = caipNetwork
    state.activeChain = chain
  },

  setRequestedCaipNetworks(requestedNetworks: ChainOptions['requestedCaipNetworks'], chain: Chain) {
    console.log('>>> [ChainController] setRequestedCaipNetworks', requestedNetworks, chain)
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

  getRequestedCaipNetworks() {
    const chains = Object.values(state.chains)

    const approvedIds: `${string}:${string}`[] = []
    const requestedIds: CaipNetwork[] = []

    chains.forEach(chain => {
      if (chain.approvedCaipNetworkIds) {
        approvedIds.push(...chain.approvedCaipNetworkIds)
      }
    })
    chains.forEach(chain => {
      if (chain.requestedCaipNetworks) {
        requestedIds.push(...chain.requestedCaipNetworks)
      }
    })

    return CoreHelperUtil.sortRequestedNetworks(approvedIds, requestedIds)
  },

  getApprovedCaipNetworkIds(chain: Chain) {
    console.log('>>> [ChainController] getApprovedCaipNetworkIds', state.chains)
    return state.chains[chain]?.approvedCaipNetworkIds
    // const allCaipNetworkIds: CaipNetworkId[] = []
    // Object.values(state.chains).forEach(chain => {
    //   if (chain.approvedCaipNetworkIds) {
    //     allCaipNetworkIds.push(...chain.approvedCaipNetworkIds)
    //   }
    // })
    // return allCaipNetworkIds
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
    console.log('>>> [ChainController] setApprovedCaipNetworksData', data?.approvedCaipNetworkIds)

    state.chains[chain].approvedCaipNetworkIds = data?.approvedCaipNetworkIds
    state.chains[chain].supportsAllNetworks = data?.supportsAllNetworks
  },

  async switchActiveNetwork(network: NetworkControllerState['caipNetwork'], chain: Chain) {
    state.chains[chain].caipNetwork = network
    state.activeCaipNetwork = network
    state.activeChain = chain
  },

  checkIfSupportedNetwork(chain: Chain, activeCaipNetworkId: CaipNetworkId | undefined) {
    console.log('>>> [ChainController] checkIfSupportedNetwork', chain, activeCaipNetworkId)
    const requestedCaipNetworks = state.chains[chain].requestedCaipNetworks
    return requestedCaipNetworks?.some(network => network.id === activeCaipNetworkId) ? false : true
  },

  resetNetwork(chain: Chain) {
    state.activeCaipNetwork = undefined
    state.activeChain = undefined
    state.chains[chain].approvedCaipNetworkIds = undefined
    state.chains[chain].supportsAllNetworks = true
    state.chains[chain].smartAccountEnabledNetworks = []
  },

  showUnsupportedChainUI() {
    console.log('>>> [ChainController] showUnsupportedChainUI')
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
