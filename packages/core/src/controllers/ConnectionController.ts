import { proxy } from 'valtio/vanilla'

// -- Types --------------------------------------------------------------------
export interface ConnectionControllerState {
  walletConnectUri: string
}

export interface ConnectionControllerClientProxy {
  getWalletConnectUri: () => Promise<ConnectionControllerState['walletConnectUri']>
  connectWalletConnect: () => Promise<void>
}

// -- Controller ---------------------------------------------------------------
export class ConnectionController {
  public state = proxy<ConnectionControllerState>({
    walletConnectUri: ''
  })

  #clientProxy: ConnectionControllerClientProxy

  public constructor(clientProxy: ConnectionControllerClientProxy) {
    this.#clientProxy = clientProxy
  }

  public async getWalletConnectUri() {
    this.state.walletConnectUri = await this.#clientProxy.getWalletConnectUri()
  }

  public async connectWalletConnect() {
    await this.#clientProxy.connectWalletConnect()
  }
}
