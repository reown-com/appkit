import { proxy, ref } from 'valtio/vanilla'

// -- Types --------------------------------------------------------------------
export interface NetworkControllerClient {
  getActiveNetwork: () => Promise<NetworkControllerState['activeNetwork']>
  getRequestedNetworks: () => Promise<NetworkControllerState['requestedNetworks']>
  getApprovedNetworks: () => Promise<NetworkControllerState['approvedNetworks']>
  switchActiveNetwork: (network: NetworkControllerState['activeNetwork']) => Promise<void>
}

export interface NetworkControllerState {
  activeNetwork: string
  requestedNetworks: string[]
  approvedNetworks: string[]
  client?: NetworkControllerClient
}

// -- State --------------------------------------------------------------------
const state = proxy<NetworkControllerState>({
  activeNetwork: '',
  requestedNetworks: [],
  approvedNetworks: [],
  client: undefined
})

// -- Controller ---------------------------------------------------------------
export const NetworkController = {
  state,

  _getClient() {
    if (!state.client) {
      throw new Error('NetworkController client not set')
    }

    return state.client
  },

  setClient(client: NetworkControllerClient) {
    state.client = ref(client)
  },

  async getActiveNetwork() {
    state.activeNetwork = await NetworkController._getClient().getActiveNetwork()
  },

  async getRequestedNetworks() {
    state.requestedNetworks = await NetworkController._getClient().getRequestedNetworks()
  },

  async getApprovedNetworks() {
    state.approvedNetworks = await NetworkController._getClient().getApprovedNetworks()
  },

  async switchActiveNetwork(network: NetworkControllerState['activeNetwork']) {
    await NetworkController._getClient().switchActiveNetwork(network)
    state.activeNetwork = network
  }
}
