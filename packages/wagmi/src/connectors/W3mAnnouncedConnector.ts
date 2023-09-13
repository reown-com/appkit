import type { Chain, WindowProvider } from '@wagmi/core'
import { ConnectorNotFoundError } from '@wagmi/core'
import { InjectedConnector } from '@wagmi/core/connectors/injected'

// -- Helpers ----------------------------------------------------------
const ANNOUNCE_EVENT = 'eip6963:announceProvider'
const REQUEST_EVENT = 'eip6963:requestProvider'
let provider: WindowProvider | undefined = undefined

// -- Types ------------------------------------------------------------
interface Info {
  uuid: string
  name: string
  icon: string
  rdns: string
}

interface Wallet {
  info: Info
  provider: WindowProvider
}

interface ConnectOptions {
  rdns: Info['rdns']
  chainId?: number
}

interface Config {
  chains?: Chain[]
}

// -- Connector --------------------------------------------------------
export class W3mAnnouncedConnector extends InjectedConnector {
  override readonly id = 'w3mAnnounced'

  override readonly name = 'w3mAnnounced'

  #wallets = new Set<Wallet>()

  public constructor(config: Config) {
    super({
      chains: config.chains,
      options: {
        shimDisconnect: true,
        getProvider: () => provider
      }
    })
    this.listenForWallets()
  }

  // -- Wagmi Methods ---------------------------------------------------
  public override async connect(options: ConnectOptions) {
    const { rdns } = options
    const wallet = [...this.#wallets].find(w => w.info.rdns === rdns)
    if (!wallet?.provider) {
      throw new ConnectorNotFoundError()
    }
    provider = wallet.provider

    return super.connect(options)
  }

  public override async disconnect() {
    await super.disconnect()
    provider = undefined
  }

  // -- Custom Methods --------------------------------------------------
  public listenForWallets() {
    if (typeof window === 'undefined') {
      return
    }

    window.addEventListener(ANNOUNCE_EVENT, (event: CustomEventInit<Wallet>) => {
      if (event.detail) {
        this.#wallets.add(event.detail)
      }
    })
    window.dispatchEvent(new Event(REQUEST_EVENT))
  }
}
