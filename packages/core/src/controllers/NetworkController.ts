import { proxy, ref } from 'valtio/vanilla'
import type { CaipChainId } from '../utils/TypeUtils'

// -- Types --------------------------------------------- //
export interface NetworkControllerClient {
  getActiveNetwork: () => Promise<NetworkControllerState['network']>
  getRequestedNetworks: () => Promise<NetworkControllerState['requestedNetworks']>
  getApprovedNetworks: () => Promise<NetworkControllerState['approvedNetworks']>
  switchActiveNetwork: (network: NetworkControllerState['network']) => Promise<void>
}

export interface NetworkControllerState {
  _client?: NetworkControllerClient
  network?: CaipChainId
  requestedNetworks?: CaipChainId[]
  approvedNetworks?: CaipChainId[]
}

// -- State --------------------------------------------- //
const state = proxy<NetworkControllerState>({})

// -- Controller ---------------------------------------- //
export const NetworkController = {
  state,

  _getClient() {
    if (!state._client) {
      throw new Error('NetworkController client not set')
    }

    return state._client
  },

  setClient(client: NetworkControllerClient) {
    state._client = ref(client)
  },

  async getNetwork() {
    state.network = await this._getClient().getActiveNetwork()
  },

  setNetwork(network: NetworkControllerState['network']) {
    state.network = network
  },

  async getRequestedNetworks() {
    state.requestedNetworks = await this._getClient().getRequestedNetworks()
  },

  async getApprovedNetworks() {
    state.approvedNetworks = await this._getClient().getApprovedNetworks()
  },

  async switchActiveNetwork(network: NetworkControllerState['network']) {
    await this._getClient().switchActiveNetwork(network)
    state.network = network
  }
}
