import type { Chain, WindowProvider } from '@wagmi/core'
import { InjectedConnector } from '@wagmi/core/connectors/injected'

// -- Helpers ----------------------------------------------------------
const connectedRdnsKey = 'connectedRdns'

// -- Types ------------------------------------------------------------
interface Info {
  uuid: string
  name: string
  icon: string
  rdns: string
}

interface EIP6963Wallet {
  info: Info
  provider: WindowProvider
}

interface ConnectOptions {
  chainId?: number
}

interface Config {
  chains?: Chain[]
}

// -- Connector --------------------------------------------------------
export class Web3ModalInjectedConnector extends InjectedConnector {
  public isEip6963 = true

  #defaultProvider?: WindowProvider = undefined

  #eip6963Wallet?: EIP6963Wallet = undefined

  public constructor(config: Config) {
    super({ chains: config.chains, options: { shimDisconnect: true } })
    this.#defaultProvider = this.options.getProvider()
  }

  // -- Wagmi Methods ---------------------------------------------------
  public override async connect(options: ConnectOptions) {
    const data = await super.connect(options)
    if (this.#eip6963Wallet) {
      this.storage?.setItem(connectedRdnsKey, this.#eip6963Wallet.info.rdns)
    }

    return data
  }

  public override async disconnect() {
    await super.disconnect()
    this.storage?.removeItem(connectedRdnsKey)
    this.#eip6963Wallet = undefined
  }

  public override async isAuthorized(eip6963Wallet?: EIP6963Wallet) {
    const connectedEIP6963Rdns = this.storage?.getItem(connectedRdnsKey)
    if (connectedEIP6963Rdns) {
      if (!eip6963Wallet || connectedEIP6963Rdns !== eip6963Wallet.info.rdns) {
        return true
      }
      this.#eip6963Wallet = eip6963Wallet
    }

    return super.isAuthorized()
  }

  public override async getProvider() {
    return Promise.resolve(this.#eip6963Wallet?.provider ?? this.#defaultProvider)
  }

  // -- Extended Methods ------------------------------------------------
  public setEip6963Wallet(eip6963Wallet: EIP6963Wallet) {
    this.#eip6963Wallet = eip6963Wallet
  }
}
