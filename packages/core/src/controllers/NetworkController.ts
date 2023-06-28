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
    this.state.activeNetwork = await this.#clientProxy.getActiveNetwork()
  }

  public async getRequestedNetworks() {
    this.state.requestedNetworks = await this.#clientProxy.getRequestedNetworks()
  }

  public async getApprovedNetworks() {
    this.state.approvedNetworks = await this.#clientProxy.getApprovedNetworks()
  }

  public async switchActiveNetwork(network: NetworkControllerState['activeNetwork']) {
    await this.#clientProxy.switchActiveNetwork(network)
    this.state.activeNetwork = network
  }
}
