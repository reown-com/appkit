import { proxy } from 'valtio/vanilla'

// -- Types --------------------------------------------------------------------
export interface ConnectionControllerState {
  walletConnectUri: string
}

export interface ConnectionControllerClientProxy {
  getWalletConnectUri: () => Promise<ConnectionControllerState['walletConnectUri']>
  connectWalletConnect: () => Promise<void>
  connectBrowserExtension?: (id: string) => Promise<void>
  connectThirdPartyWallet?: (id: string) => Promise<void>
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

  public async connectBrowserExtension(id: string) {
    if (this.#clientProxy.connectBrowserExtension) {
      await this.#clientProxy.connectBrowserExtension(id)
    }
  }

  public async connectThirdPartyWallet(id: string) {
    if (this.#clientProxy.connectThirdPartyWallet) {
      await this.#clientProxy.connectThirdPartyWallet(id)
    }
  }
}
