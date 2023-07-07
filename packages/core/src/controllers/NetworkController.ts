import { proxy, ref } from 'valtio/vanilla'
import type { CaipChainId } from '../utils/TypeUtils'

// -- Types --------------------------------------------- //
export interface NetworkControllerClient {
  switchNetwork: (network: NetworkControllerState['network']) => Promise<void>
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

  setNetwork(network: NetworkControllerState['network']) {
    state.network = network
  },

  setRequestedNetworks(requestedNetworks: NetworkControllerState['requestedNetworks']) {
    state.requestedNetworks = requestedNetworks
  },

  setApprovedNetworks(approvedNetworks: NetworkControllerState['approvedNetworks']) {
    state.approvedNetworks = approvedNetworks
  },

  async switchActiveNetwork(network: NetworkControllerState['network']) {
    await this._getClient().switchNetwork(network)
    state.network = network
  }
}
