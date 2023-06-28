import { proxy } from 'valtio/vanilla'

// -- Types --------------------------------------------------------------------
export interface NetworkControllerState {
  activeNetwork: string
  requestedNetworks: string[]
  approvedNetworks: string[]
}

export interface NetworkControllerClientProxy {
  getActiveNetwork: () => Promise<NetworkControllerState['activeNetwork']>
  getRequestedNetworks: () => Promise<NetworkControllerState['requestedNetworks']>
  getApprovedNetworks: () => Promise<NetworkControllerState['approvedNetworks']>
  switchActiveNetwork: (network: NetworkControllerState['activeNetwork']) => Promise<void>
}

// -- Controller ---------------------------------------------------------------
export class NetworkController {
  public state = proxy<NetworkControllerState>({
    activeNetwork: '',
    requestedNetworks: [],
    approvedNetworks: []
  })

  #clientProxy: NetworkControllerClientProxy

  public constructor(clientProxy: NetworkControllerClientProxy) {
    this.#clientProxy = clientProxy
  }

  public async getActiveNetwork() {
    const activeNetwork = await this.#clientProxy.getActiveNetwork()
    this.state.activeNetwork = activeNetwork
  }

  public async getRequestedNetworks() {
    const requestedNetworks = await this.#clientProxy.getRequestedNetworks()
    this.state.requestedNetworks = requestedNetworks
  }

  public async getApprovedNetworks() {
    const approvedNetworks = await this.#clientProxy.getApprovedNetworks()
    this.state.approvedNetworks = approvedNetworks
  }

  public async switchActiveNetwork(network: NetworkControllerState['activeNetwork']) {
    await this.#clientProxy.switchActiveNetwork(network)
    this.state.activeNetwork = network
  }
}
