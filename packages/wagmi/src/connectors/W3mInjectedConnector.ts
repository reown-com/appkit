import type { WindowProvider } from '@wagmi/core'
import { InjectedConnector } from '@wagmi/core/connectors/injected'

// -- Types ------------------------------------------------------------
interface ConnectOptions {
  provider?: WindowProvider
  chainId?: number
}

// -- Connector --------------------------------------------------------
export class W3mInjectedConnector extends InjectedConnector {
  public override async connect(options: ConnectOptions) {
    const { provider, chainId } = options
    if (provider) {
      this.options.getProvider = () => provider
    }

    return super.connect({ chainId })
  }
}
