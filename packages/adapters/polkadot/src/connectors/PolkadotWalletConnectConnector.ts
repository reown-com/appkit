'use client'

import UniversalProvider from '@walletconnect/universal-provider'

import type { RequestArguments } from '@reown/appkit'
import { type CaipNetwork } from '@reown/appkit-common'
import { WalletConnectConnector, WcHelpersUtil } from '@reown/appkit-controllers'

/**
 * WalletConnect connector for Polkadot chains
 * Follows the same pattern as BitcoinWalletConnectConnector
 */
export class PolkadotWalletConnectConnector extends WalletConnectConnector<'polkadot'> {
  private readonly getActiveChain: () => CaipNetwork | undefined

  constructor(config: {
    provider: UniversalProvider
    chains: CaipNetwork[]
    getActiveChain: () => CaipNetwork | undefined
  }) {
    super({
      provider: config.provider,
      caipNetworks: config.chains,
      namespace: 'polkadot'
    })
    this.getActiveChain = config.getActiveChain
  }

  // -- Public ------------------------------------------- //
  public override get chains() {
    return this.sessionChains
      .map(chainId => this.caipNetworks.find(chain => chain.caipNetworkId === chainId))
      .filter(Boolean) as CaipNetwork[]
  }

  public async connect() {
    return Promise.reject(
      new Error('Connection of WalletConnectProvider should be done via PolkadotAdapter')
    )
  }

  public async switchNetwork(_caipNetworkId: string): Promise<void> {
    // PolkadotAdapter.switchNetwork will be called instead
    return Promise.resolve()
  }

  public request<T>(args: RequestArguments) {
    return this.internalRequest(args) as T
  }

  public setDefaultChain(chainId: string) {
    this.provider.setDefaultChain(chainId)
  }

  // -- Private ------------------------------------------ //
  private get sessionChains() {
    return WcHelpersUtil.getChainsFromNamespaces(this.provider.session?.namespaces)
  }

  private async internalRequest(args: RequestArguments) {
    const chain = this.getActiveChain()

    if (!chain) {
      throw new Error('Chain not found')
    }

    return await this.provider.request(args, chain.caipNetworkId)
  }
}
