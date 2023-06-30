import { proxy, ref } from 'valtio/vanilla'

// -- Types --------------------------------------------------------------------
export interface NetworkControllerClient {
  getActiveNetwork: () => Promise<NetworkControllerState['activeNetwork']>
  getRequestedNetworks: () => Promise<NetworkControllerState['requestedNetworks']>
  getApprovedNetworks: () => Promise<NetworkControllerState['approvedNetworks']>
  switchActiveNetwork: (network: NetworkControllerState['activeNetwork']) => Promise<void>
}

export interface NetworkControllerState {
  _client?: NetworkControllerClient
  activeNetwork: string
  requestedNetworks: string[]
  approvedNetworks: string[]
}

// -- State --------------------------------------------------------------------
const state = proxy<NetworkControllerState>({
  _client: undefined,
  activeNetwork: '',
  requestedNetworks: [],
  approvedNetworks: []
})

// -- Controller ---------------------------------------------------------------
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

  async getActiveNetwork() {
    state.activeNetwork = await this._getClient().getActiveNetwork()
  },

  async getRequestedNetworks() {
    state.requestedNetworks = await this._getClient().getRequestedNetworks()
  },

  async getApprovedNetworks() {
    state.approvedNetworks = await this._getClient().getApprovedNetworks()
  },

  async switchActiveNetwork(network: NetworkControllerState['activeNetwork']) {
    await this._getClient().switchActiveNetwork(network)
    state.activeNetwork = network
  }
}
