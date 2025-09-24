import UniversalProvider from '@walletconnect/universal-provider'

import { type RequestArguments, WcHelpersUtil } from '@reown/appkit'
import { type CaipNetwork, ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { ChainController } from '@reown/appkit-controllers'
import { HelpersUtil } from '@reown/appkit-utils'
import type { BitcoinConnector } from '@reown/appkit-utils/bitcoin'
import { WalletConnectConnector } from '@reown/appkit/connectors'

import { AddressPurpose } from '../utils/BitcoinConnector.js'
import { ProviderEventEmitter } from '../utils/ProviderEventEmitter.js'

export type WalletConnectProviderConfig = {
  provider: UniversalProvider
  chains: CaipNetwork[]
  getActiveChain: () => CaipNetwork | undefined
}

export class BitcoinWalletConnectConnector
  extends WalletConnectConnector<'bip122'>
  implements BitcoinConnector
{
  private readonly getActiveChain: WalletConnectProviderConfig['getActiveChain']

  private eventEmitter = new ProviderEventEmitter()
  public readonly emit = this.eventEmitter.emit.bind(this.eventEmitter)
  public readonly on = this.eventEmitter.on.bind(this.eventEmitter)
  public readonly removeListener = this.eventEmitter.removeListener.bind(this.eventEmitter)

  constructor({ provider, chains, getActiveChain }: WalletConnectProviderConfig) {
    super({ provider, caipNetworks: chains, namespace: 'bip122' })
    this.getActiveChain = getActiveChain
  }

  // -- Public ------------------------------------------- //
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

  public async signMessage({ message, address, protocol }: BitcoinConnector.SignMessageParams) {
    this.checkIfMethodIsSupported('signMessage')

    const signedMessage = await this.internalRequest({
      method: 'signMessage',
      params: { message, account: address, address, protocol }
    })

    return Buffer.from(signedMessage.signature, 'hex').toString('base64')
  }

  public async sendTransfer({ recipient, amount }: BitcoinConnector.SendTransferParams) {
    this.checkIfMethodIsSupported('sendTransfer')
    const account = this.getAccount(true)

    const result = await this.internalRequest({
      method: 'sendTransfer',
      params: {
        account,
        recipientAddress: recipient,
        amount
      }
    })

    return result.txid
  }

  public async getAccountAddresses(): Promise<BitcoinConnector.AccountAddress[]> {
    this.checkIfMethodIsSupported('getAccountAddresses')

    const addresses = await this.internalRequest({
      method: 'getAccountAddresses',
      params: undefined
    })

    return addresses.map(address => ({ address, purpose: AddressPurpose.Payment }))
  }

  public async signPSBT(
    params: BitcoinConnector.SignPSBTParams
  ): Promise<BitcoinConnector.SignPSBTResponse> {
    this.checkIfMethodIsSupported('signPsbt')
    const account = this.getAccount(true)

    const response = await this.internalRequest({
      method: 'signPsbt',
      params: {
        account,
        psbt: params.psbt,
        signInputs: params.signInputs,
        broadcast: params.broadcast
      }
    })

    return {
      psbt: response.psbt,
      txid: response.txid
    }
  }

  public async switchNetwork(_caipNetworkId: string): Promise<void> {
    // ChainAdapterBlueprint.switchNetwork will be called instead
    return Promise.resolve()
  }

  public request<T>(args: RequestArguments) {
    // @ts-expect-error - args type should match internalRequest arguments but it's not correctly typed in Provider
    return this.internalRequest(args) as T
  }

  // -- Private ------------------------------------------ //
  private get sessionChains() {
    return WcHelpersUtil.getChainsFromNamespaces(this.provider.session?.namespaces)
  }

  private getAccount<Required extends boolean>(
    required?: Required
  ): Required extends true ? string : string | undefined {
    const caipAddress = ChainController.getAccountData(
      CommonConstantsUtil.CHAIN.BITCOIN
    )?.caipAddress
    const account = this.provider.session?.namespaces[
      CommonConstantsUtil.CHAIN.BITCOIN
    ]?.accounts.find(_account => HelpersUtil.isLowerCaseMatch(_account, caipAddress))

    if (!account) {
      if (required) {
        throw new Error('Account not found')
      }

      return undefined as Required extends true ? string : string | undefined
    }

    const address = account.split(':')[2]
    if (!address) {
      if (required) {
        throw new Error('Address not found')
      }

      return undefined as Required extends true ? string : string | undefined
    }

    return address
  }

  private checkIfMethodIsSupported(method: WalletConnectProvider.RequestMethod) {
    if (!this.provider.session?.namespaces['bip122']?.methods.includes(method)) {
      throw new Error(`Method ${method} is not supported`)
    }
  }

  private async internalRequest<Method extends WalletConnectProvider.RequestMethod>({
    method,
    params
  }: WalletConnectProvider.InternalRequestParams<Method>) {
    const chain = this.getActiveChain()

    if (!chain) {
      throw new Error('Chain not found')
    }

    return await this.provider.request<WalletConnectProvider.RequestMethods[Method]['returns']>(
      {
        method,
        params
      },
      chain.caipNetworkId
    )
  }
}

export namespace WalletConnectProvider {
  export type Request<Params, Result> = {
    params: Params
    returns: Result
  }

  export type WCSignMessageParams = {
    message: string
    account: string
    address: string
    protocol?: 'ecdsa' | 'bip322'
  }

  export type WCSignMessageResponse = {
    signature: string
    address: string
    messageHash: string
  }

  export type WCSendTransferParams = {
    account: string
    recipientAddress: string
    amount: string
    changeAddress?: string
    memo?: string
  }

  export type WCGetAccountAddressesResponse = {
    address: string
    publicKey: Uint8Array
    path: string
    intention: 'payment' | 'ordinal'
  }[]

  export type WCSendTransferResponse = {
    txid: string
  }

  export type WCSignPSBTParams = {
    account: string
    psbt: string
    signInputs: {
      address: string
      index: number
      sighashTypes?: number[]
    }[]
    broadcast?: boolean
  }

  export type WCSignPSBTResponse = {
    psbt: string
    txid?: string
  }

  export type RequestMethods = {
    signMessage: Request<WCSignMessageParams, WCSignMessageResponse>
    sendTransfer: Request<WCSendTransferParams, WCSendTransferResponse>
    getAccountAddresses: Request<undefined, string[]>
    signPsbt: Request<WCSignPSBTParams, WCSignPSBTResponse>
  }

  export type RequestMethod = keyof RequestMethods

  export type InternalRequestParams<Method extends RequestMethod> = {
    method: Method
    params: RequestMethods[Method]['params']
  }
}
