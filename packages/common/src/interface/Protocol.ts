export interface IProtocolConnectOptions {
  network: string
  providerUrl?: string
  walletOptions?: any
}

export interface IProtocolConnectionResult {
  address: string
  network: string
  provider: any
  client: any
}

export interface IProtocolModule {
  connect(options: IProtocolConnectOptions): Promise<IProtocolConnectionResult>
  disconnect(): Promise<void>
  getClient(): any // Returns the specific client instance (e.g., ethers, wagmi, solana)
}

export class Web3ModalProtocol {
  private modules: { [key: string]: IProtocolModule } = {}

  registerModule(protocol: string, module: IProtocolModule) {
    this.modules[protocol] = module
  }

  getProtocolModule(protocol: string) {
    const protocolModule = this.modules[protocol]

    if (!protocolModule) {
      throw new Error(`Protocol module for ${protocol} not found`)
    }

    return protocolModule
  }

  async connect(
    protocol: string,
    options: IProtocolConnectOptions
  ): Promise<IProtocolConnectionResult> {
    const protocolModule = this.getProtocolModule(protocol)

    return protocolModule.connect(options)
  }

  async disconnect(protocol: string): Promise<void> {
    const protocolModule = this.getProtocolModule(protocol)

    return protocolModule.disconnect()
  }

  getClient(protocol: string): any {
    const protocolModule = this.getProtocolModule(protocol)

    return protocolModule.getClient()
  }
}
