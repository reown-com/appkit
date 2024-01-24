import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, ref } from 'valtio/vanilla'
import type { CaipNetwork, CaipNetworkId } from '../utils/TypeUtil.js'
import { PublicStateController } from './PublicStateController.js'
import { TransactionsController } from './TransactionsController.js'

// -- Types --------------------------------------------- //
export interface NetworkControllerClient {
  switchCaipNetwork: (network: NetworkControllerState['caipNetwork']) => Promise<void>
  getApprovedCaipNetworksData: () => Promise<{
    approvedCaipNetworkIds: NetworkControllerState['approvedCaipNetworkIds']
    supportsAllNetworks: NetworkControllerState['supportsAllNetworks']
  }>
}

export interface NetworkControllerState {
  supportsAllNetworks: boolean
  isDefaultCaipNetwork: boolean
  _client?: NetworkControllerClient
  caipNetwork?: CaipNetwork
  requestedCaipNetworks?: CaipNetwork[]
  approvedCaipNetworkIds?: CaipNetworkId[]
}

type StateKey = keyof NetworkControllerState

// -- State --------------------------------------------- //
const state = proxy<NetworkControllerState>({
  supportsAllNetworks: true,
  isDefaultCaipNetwork: false
})

// -- Controller ---------------------------------------- //
export const NetworkController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: NetworkControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  _getClient() {
    if (!state._client) {
      throw new Error('NetworkController client not set')
    }

    return state._client
  },

  setClient(client: NetworkControllerClient) {
    state._client = ref(client)
  },

  setCaipNetwork(caipNetwork: NetworkControllerState['caipNetwork']) {
    TransactionsController.setPrevChainInView(TransactionsController.state.chainInView)
    TransactionsController.setChainInView(caipNetwork?.name)

    state.caipNetwork = caipNetwork
    PublicStateController.set({ selectedNetworkId: caipNetwork?.id })
  },

  setDefaultCaipNetwork(caipNetwork: NetworkControllerState['caipNetwork']) {
    state.caipNetwork = caipNetwork
    PublicStateController.set({ selectedNetworkId: caipNetwork?.id })
    state.isDefaultCaipNetwork = true
  },

  setRequestedCaipNetworks(requestedNetworks: NetworkControllerState['requestedCaipNetworks']) {
    state.requestedCaipNetworks = requestedNetworks
  },

  async getApprovedCaipNetworksData() {
    const data = await this._getClient().getApprovedCaipNetworksData()
    state.supportsAllNetworks = data.supportsAllNetworks
    state.approvedCaipNetworkIds = data.approvedCaipNetworkIds
  },

  async switchActiveNetwork(network: NetworkControllerState['caipNetwork']) {
    await this._getClient().switchCaipNetwork(network)
    state.caipNetwork = network
  },

  resetNetwork() {
    if (!state.isDefaultCaipNetwork) {
      state.caipNetwork = undefined
    }
    state.approvedCaipNetworkIds = undefined
    state.supportsAllNetworks = true
  }
}
