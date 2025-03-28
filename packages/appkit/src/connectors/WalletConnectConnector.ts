import type { SessionTypes } from '@walletconnect/types'
import UniversalProvider from '@walletconnect/universal-provider'

import { type CaipNetwork, type ChainNamespace, ConstantsUtil } from '@reown/appkit-common'
import { OptionsController, SIWXUtil } from '@reown/appkit-controllers'
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
      const universalProviderConfigOverride =
        OptionsController.state.universalProviderConfigOverride
      const namespaces = WcHelpersUtil.createNamespaces(
        this.caipNetworks,
        universalProviderConfigOverride
      )
      await this.provider.connect({
        optionalNamespaces: namespaces
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
      methods: OPTIONAL_METHODS
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

const OPTIONAL_METHODS = [
  'eth_accounts',
  'eth_requestAccounts',
  'eth_sendRawTransaction',
  'eth_sign',
  'eth_signTransaction',
  'eth_signTypedData',
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',
  'eth_sendTransaction',
  'personal_sign',
  'wallet_switchEthereumChain',
  'wallet_addEthereumChain',
  'wallet_getPermissions',
  'wallet_requestPermissions',
  'wallet_registerOnboarding',
  'wallet_watchAsset',
  'wallet_scanQRCode',
  // EIP-5792
  'wallet_getCallsStatus',
  'wallet_sendCalls',
  'wallet_getCapabilities',
  // EIP-7715
  'wallet_grantPermissions',
  'wallet_revokePermissions',
  //EIP-7811
  'wallet_getAssets'
]
