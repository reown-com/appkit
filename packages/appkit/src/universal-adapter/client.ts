import type UniversalProvider from '@walletconnect/universal-provider'
import { AdapterBlueprint } from '../adapters/ChainAdapterBlueprint'
import { WcHelpersUtil } from '../utils'
import type { CaipNetwork } from '@reown/appkit-common'

export class UniversalAdapter extends AdapterBlueprint {
  public async connectWalletConnect(onUri: (uri: string) => void) {
    const connector = this.connectors.find(c => c.type === 'WALLET_CONNECT')

    const provider = connector?.provider

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

  // eslint-disable-next-line @typescript-eslint/require-await
  public async switchNetwork(caipNetwork: CaipNetwork, provider?: UniversalProvider) {
    console.log('switchNetwork', provider)

    if (!provider) {
      throw new Error('UniversalAdapter:switchNetwork - provider is undefined')
    }
    this.provider = provider
    provider.setDefaultChain(caipNetwork.id)
  }
}
