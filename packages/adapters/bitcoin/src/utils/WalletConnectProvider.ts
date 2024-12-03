import UniversalProvider from '@walletconnect/universal-provider'
import type { CaipNetwork } from '@reown/appkit-common'
import { WcHelpersUtil, type RequestArguments } from '@reown/appkit'
import type { BitcoinConnector } from './BitcoinConnector.js'
import { ProviderEventEmitter } from './ProviderEventEmitter.js'

export type WalletConnectProviderConfig = {
  provider: UniversalProvider
  chains: CaipNetwork[]
  getActiveChain: () => CaipNetwork | undefined
}

export class WalletConnectProvider extends ProviderEventEmitter implements BitcoinConnector {
  public readonly id = 'WalletConnect'
  public readonly name = 'WalletConnect'
  public readonly type = 'WALLET_CONNECT'
  public readonly chain = 'bip122'
  public readonly icon =
    'https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/05338e12-4f75-4982-4e8a-83c67b826b00/md'
  public provider: UniversalProvider

  private readonly requestedChains: CaipNetwork[]
  private readonly getActiveChain: WalletConnectProviderConfig['getActiveChain']

  constructor({ provider, chains, getActiveChain }: WalletConnectProviderConfig) {
    super()
    this.requestedChains = chains
    this.provider = provider
    this.getActiveChain = getActiveChain
  }

  // -- Public ------------------------------------------- //
  public get chains() {
    return this.sessionChains
      .map(chainId => this.requestedChains.find(chain => chain.id === chainId))
      .filter(Boolean) as CaipNetwork[]
  }

  public async connect() {
    return Promise.reject(
      new Error('Connection of WalletConnectProvider should be done via UniversalAdapter')
    )
  }

  public async disconnect() {
    return this.provider.disconnect()
  }

  public async signMessage({ message, address }: BitcoinConnector.SignMessageParams) {
    this.checkIfMethodIsSupported('signMessage')

    const signedMessage = await this.internalRequest({
      method: 'signMessage',
      params: { message, account: address, address }
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

    return addresses.map(address => ({ address, purpose: 'payment' }))
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
    const account = this.provider.session?.namespaces['bip122']?.accounts[0]
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

  private internalRequest<Method extends WalletConnectProvider.RequestMethod>({
    method,
    params
  }: WalletConnectProvider.InternalRequestParams<Method>) {
    const chain = this.getActiveChain()

    if (!chain) {
      throw new Error('Chain not found')
    }

    return this.provider.request<WalletConnectProvider.RequestMethods[Method]['returns']>(
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
