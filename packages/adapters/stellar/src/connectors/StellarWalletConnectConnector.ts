import type { CaipNetwork } from '@reown/appkit-common'
import { ConstantsUtil as CommonConstantsUtil, ConstantsUtil } from '@reown/appkit-common'
import {
  ChainController,
  type RequestArguments,
  WalletConnectConnector,
  WcHelpersUtil
} from '@reown/appkit-controllers'
import type { StellarConnector } from '@reown/appkit-utils/stellar'

import { ProviderEventEmitter } from '../utils/ProviderEventEmitter.js'

export type WalletConnectProviderConfig = {
  provider: WalletConnectConnector['provider']
  chains: CaipNetwork[]
}

/**
 * WalletConnect connector for Stellar.
 *
 * Implements the method set from the Stellar WalletConnect spec:
 * `stellar_signXDR`, `stellar_signAndSubmitXDR`, `stellar_signMessage` and
 * `stellar_signAuthEntry`. Every request is bound to the session's chain id --
 * the network is never taken from caller-supplied payload.
 */
export class StellarWalletConnectConnector
  extends WalletConnectConnector<'stellar'>
  implements StellarConnector
{
  public override readonly chain = CommonConstantsUtil.CHAIN.STELLAR

  private eventEmitter = new ProviderEventEmitter()
  public readonly emit = this.eventEmitter.emit.bind(this.eventEmitter)
  public readonly on = this.eventEmitter.on.bind(this.eventEmitter)
  public readonly removeListener = this.eventEmitter.removeListener.bind(this.eventEmitter)

  constructor({ provider, chains }: WalletConnectProviderConfig) {
    super({ provider, caipNetworks: chains, namespace: ConstantsUtil.CHAIN.STELLAR })
  }

  get imageUrl(): string | undefined {
    return undefined
  }

  get info() {
    return undefined
  }

  get chainsList() {
    return this.chains
  }

  public override get chains() {
    return this.sessionChains
      .map(chainId => this.caipNetworks.find(chain => chain.caipNetworkId === chainId))
      .filter(Boolean) as CaipNetwork[]
  }

  public async connect() {
    return Promise.reject(
      new Error('Connection of WalletConnectProvider should be done via UniversalAdapter')
    )
  }

  public async signXDR(
    params: StellarConnector.SignXDRParams
  ): Promise<StellarConnector.SignXDRResult> {
    return this.requestStellarMethod<StellarConnector.SignXDRResult>('stellar_signXDR', {
      xdr: params.xdr,
      address: params.address
    })
  }

  public async signAndSubmitXDR(
    params: StellarConnector.SignAndSubmitXDRParams
  ): Promise<StellarConnector.SignAndSubmitXDRResult> {
    const result = await this.requestStellarMethod<{
      tx_hash?: string
      signedXDR?: string
      successful?: boolean
    }>('stellar_signAndSubmitXDR', {
      xdr: params.xdr,
      address: params.address,
      ...(params.waitForInclusion === undefined
        ? {}
        : { waitForInclusion: params.waitForInclusion })
    })

    return {
      txHash: result?.tx_hash ?? '',
      signedXDR: result?.signedXDR ?? '',
      ...(result?.successful === undefined ? {} : { successful: result.successful })
    }
  }

  public async signMessage(
    params: StellarConnector.SignMessageParams
  ): Promise<StellarConnector.SignMessageResult> {
    return this.requestStellarMethod<StellarConnector.SignMessageResult>('stellar_signMessage', {
      message: params.message,
      address: params.address,
      ...(params.messageEncoding === undefined ? {} : { messageEncoding: params.messageEncoding })
    })
  }

  public async signAuthEntry(
    params: StellarConnector.SignAuthEntryParams
  ): Promise<StellarConnector.SignAuthEntryResult> {
    return this.requestStellarMethod<StellarConnector.SignAuthEntryResult>(
      'stellar_signAuthEntry',
      {
        authEntry: params.authEntry,
        address: params.address
      }
    )
  }

  async switchNetwork(): Promise<void> {
    return Promise.resolve()
  }

  public request<T>(args: RequestArguments) {
    // @ts-expect-error - args type should match internalRequest arguments but it's not correctly typed in Provider
    return this.internalRequest(args) as T
  }

  public setDefaultChain(chainId: string) {
    this.provider?.setDefaultChain(chainId)
  }

  // -- Internals ----------------------------------------------------- //
  /**
   * Issues a `stellar_*` request against the currently active Stellar network.
   *
   * `chain` and `account` are attached to every payload: wallets use them to
   * route the request to the right key, and binding the chain here means the
   * signer resolves the network passphrase from the session rather than from
   * anything the caller supplied.
   */
  private async requestStellarMethod<T>(
    method: string,
    params: { address: string } & Record<string, unknown>
  ): Promise<T> {
    const chain = ChainController.getCaipNetworkByNamespace(ConstantsUtil.CHAIN.STELLAR)

    if (!chain) {
      throw new Error('Chain not found')
    }

    const { address, ...rest } = params

    return await this.provider.request<T>(
      {
        method,
        params: {
          ...rest,
          chain: chain.caipNetworkId,
          account: `${chain.caipNetworkId}:${address}`
        }
      },
      chain.caipNetworkId
    )
  }

  private get sessionChains() {
    return WcHelpersUtil.getChainsFromNamespaces(this.provider.session?.namespaces)
  }
}
