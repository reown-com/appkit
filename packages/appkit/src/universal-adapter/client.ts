import type UniversalProvider from '@walletconnect/universal-provider'
import { AdapterBlueprint } from '../adapters/ChainAdapterBlueprint.js'
import { WcHelpersUtil } from '../utils/index.js'
import type { CaipNetwork } from '@reown/appkit-common'
import type { Connector } from '@reown/appkit-core'

export class UniversalAdapter extends AdapterBlueprint {
  public async connectWalletConnect(onUri: (uri: string) => void) {
    const connector = this.connectors.find(c => c.type === 'WALLET_CONNECT')

    const provider = connector?.provider as UniversalProvider

    if (!this.caipNetworks || !provider) {
      throw new Error(
        'UniversalAdapter:connectWalletConnect - caipNetworks or provider is undefined'
      )
    }

    provider.on('display_uri', (uri: string) => {
      onUri(uri)
    })

    const namespaces = WcHelpersUtil.createNamespaces(this.caipNetworks)

    await provider.connect({ optionalNamespaces: namespaces })
  }

  public async disconnect() {
    const connector = this.connectors.find(c => c.id === 'WALLET_CONNECT')
    const provider = connector?.provider
    await provider?.disconnect()
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async switchNetwork(caipNetwork: CaipNetwork, provider?: UniversalProvider) {
    if (!provider) {
      throw new Error('UniversalAdapter:switchNetwork - provider is undefined')
    }
    this.provider = provider
    provider.setDefaultChain(caipNetwork.id)
  }
}
