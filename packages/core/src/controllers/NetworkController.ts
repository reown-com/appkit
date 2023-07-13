import { proxy, ref } from 'valtio/vanilla'
import type { CaipChainId } from '../utils/TypeUtils'

// -- Types --------------------------------------------- //
export interface NetworkControllerClient {
  switchCaipNetwork: (network: NetworkControllerState['caipNetwork']) => Promise<void>
}

export interface NetworkControllerState {
  _client?: NetworkControllerClient
  caipNetwork?: CaipChainId
  requestedCaipNetworks?: CaipChainId[]
  approvedCaipNetworks?: CaipChainId[]
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

  setCaipNetwork(caipNetwork: NetworkControllerState['caipNetwork']) {
    state.caipNetwork = caipNetwork
  },

  setRequestedCaipNetworks(requestedNetworks: NetworkControllerState['requestedCaipNetworks']) {
    state.requestedCaipNetworks = requestedNetworks
  },

  setApprovedCaipNetworks(approvedNetworks: NetworkControllerState['approvedCaipNetworks']) {
    state.approvedCaipNetworks = approvedNetworks
  },

  async switchActiveNetwork(network: NetworkControllerState['caipNetwork']) {
    await this._getClient().switchCaipNetwork(network)
    state.caipNetwork = network
  }
}
