import type { SessionTypes } from '@walletconnect/types'
import UniversalProvider from '@walletconnect/universal-provider'

import { type CaipNetwork, type ChainNamespace, ConstantsUtil } from '@reown/appkit-common'

import { SIWXUtil } from '../../utils/SIWXUtil.js'
import { WcHelpersUtil } from '../../utils/WalletConnectUtil.js'
import { ChainController } from '../ChainController.js'
import { OptionsController } from '../OptionsController.js'
import type { ChainAdapterConnector } from './types.js'

export class WalletConnectConnector<Namespace extends ChainNamespace = ChainNamespace>
  implements ChainAdapterConnector
{
  public readonly id = ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
  public readonly name = 'WalletConnect'
  public readonly type = 'WALLET_CONNECT'
  public readonly imageId = 'ef1a1fcf-7fe8-4d69-bd6d-fda1345b4400'
  public readonly chain: Namespace
  public provider: UniversalProvider
  protected caipNetworks: CaipNetwork[]
  private getCaipNetworks = ChainController.getCaipNetworks.bind(ChainController)

  constructor({ provider, namespace }: WalletConnectConnector.Options<Namespace>) {
    this.caipNetworks = this.getCaipNetworks()
    this.provider = provider
    this.chain = namespace
  }

  get chains() {
    return this.getCaipNetworks()
  }

  async connectWalletConnect() {
    const isAuthenticated = await this.authenticate()

    if (!isAuthenticated) {
      const caipNetworks = this.getCaipNetworks()
      const universalProviderConfigOverride =
        OptionsController.state.universalProviderConfigOverride
      const namespaces = WcHelpersUtil.createNamespaces(
        caipNetworks,
        universalProviderConfigOverride
      )
      await this.provider.connect({ optionalNamespaces: namespaces })
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
