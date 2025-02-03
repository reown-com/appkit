import type { SessionTypes } from '@walletconnect/types'
import UniversalProvider from '@walletconnect/universal-provider'

import { type CaipNetwork, type ChainNamespace, ConstantsUtil } from '@reown/appkit-common'
import { SIWXUtil } from '@reown/appkit-core'
import { PresetsUtil } from '@reown/appkit-utils'

import type { ChainAdapterConnector } from '../adapters/ChainAdapterConnector.js'
import { WcHelpersUtil } from '../utils/index.js'

export class WalletConnectConnector<Namespace extends ChainNamespace = ChainNamespace>
  implements ChainAdapterConnector
{
  public readonly id = ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
  public readonly name = PresetsUtil.ConnectorNamesMap[
    ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
  ] as string
  public readonly type = 'WALLET_CONNECT'
  public readonly imageId = PresetsUtil.ConnectorImageIds[ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT]
  public readonly chain: Namespace

  public provider: UniversalProvider

  protected caipNetworks: CaipNetwork[]

  constructor({ provider, caipNetworks, namespace }: WalletConnectConnector.Options<Namespace>) {
    this.caipNetworks = caipNetworks
    this.provider = provider
    this.chain = namespace
  }

  get chains() {
    return this.caipNetworks
  }

  async connectWalletConnect() {
    const isAuthenticated = await this.authenticate()

    if (!isAuthenticated) {
      await this.provider.connect({
        optionalNamespaces: WcHelpersUtil.createNamespaces(this.caipNetworks)
      })
    }

    return {
      clientId: await this.provider.client.core.crypto.getClientId(),
      session: this.provider.session as SessionTypes.Struct
    }
  }

  async disconnect() {
    await this.provider.disconnect()
  }

  async authenticate(): Promise<boolean> {
    const chains = this.chains.map(network => network.caipNetworkId)

    return SIWXUtil.universalProviderAuthenticate({
      universalProvider: this.provider,
      chains,
      // Authenticate is only available for EIP-155 chains
      methods: WcHelpersUtil.getMethodsByChainNamespace('eip155')
    })
  }
}

export namespace WalletConnectConnector {
  export type Options<Namespace extends ChainNamespace> = {
    provider: UniversalProvider
    caipNetworks: CaipNetwork[]
    namespace: Namespace
  }

  export type ConnectResult = {
    clientId: string | null
    session: SessionTypes.Struct
  }
}
