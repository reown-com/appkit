import UniversalProvider from '@walletconnect/universal-provider'
import type { SessionTypes } from '@walletconnect/types'
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
  public session?: SessionTypes.Struct
  public provider: UniversalProvider

  private readonly requestedChains: CaipNetwork[]
  private readonly getActiveChain: WalletConnectProviderConfig['getActiveChain']

  constructor({ provider, chains, getActiveChain }: WalletConnectProviderConfig) {
    super()
    this.requestedChains = chains
    this.provider = provider
    this.getActiveChain = getActiveChain
    if (this.provider.session) {
      this.session = this.provider.session
    }
  }

  // -- Universal Provider Events ------------------------ //
  public onUri?: (uri: string) => void

  // -- Public ------------------------------------------- //

  public get chains() {
    return this.sessionChains
      .map(chainId => this.requestedChains.find(chain => chain.id === chainId))
      .filter(Boolean) as CaipNetwork[]
  }

  public async connect() {
    const rpcMap = this.requestedChains.reduce<Record<string, string>>((acc, chain) => {
      acc[chain.caipNetworkId] = chain.rpcUrls.default.http[0] || ''

      return acc
    }, {})

    if (this.provider.session?.namespaces['bip122']) {
      this.session = this.provider.session
    } else {
      this.provider.on('display_uri', this.onUri)
      this.session = await this.provider.connect({
        optionalNamespaces: {
          bip122: {
            // Double check these with Felipe
            chains: this.chains.map(chain => chain.caipNetworkId),
            methods: ['sendTransfer', 'signMessage', 'signPsbt', 'getAccountAddresses'],
            events: ['bip122_addressesChanged'],
            rpcMap
          }
        }
      })
      this.provider.removeListener('display_uri', this.onUri)
    }

    const account = this.getAccount(true)

    this.emit('connect', { chainId: String(this.getActiveChain()?.id) })

    return account
  }

  public async disconnect() {
    await this.provider?.disconnect()
    this.emit('disconnect', undefined)
  }

  public async signMessage({ message, address }: BitcoinConnector.SignMessageParams) {
    this.checkIfMethodIsSupported('signMessage')

    const signedMessage = await this.request<WalletConnectProvider.WCSignMessageResponse>({
      method: 'signMessage',
      params: { message, account: address, address }
    })

    return signedMessage.signature
  }

  public async sendTransfer({ recipient, amount }: BitcoinConnector.SendTransferParams) {
    this.checkIfMethodIsSupported('sendTransfer')
    const account = this.getAccount(true)

    const result = await this.request<WalletConnectProvider.WCSendTransferResponse>({
      method: 'sendTransfer',
      params: {
        account,
        recipientAddress: recipient,
        amount
      }
    })

    return result.txid
  }

  public request<T>({ method, params }: RequestArguments) {
    const chain = this.chains.find(c => this.getActiveChain()?.id === c.id)

    if (!chain) {
      throw new Error('Chain not found')
    }

    return this.provider?.request<T>(
      {
        method,
        params
      },
      String(chain.id)
    )
  }

  public async getAccountAddresses(): Promise<BitcoinConnector.AccountAddress[]> {
    this.checkIfMethodIsSupported('getAccountAddresses')

    const addresses = await this.request<string[]>({
      method: 'getAccountAddresses',
      params: undefined
    })

    return addresses.map(address => ({ address }))
  }
  // -- Private ------------------------------------------ //

  private get sessionChains() {
    return WcHelpersUtil.getChainsFromNamespaces(this.session?.namespaces)
  }

  private getAccount<Required extends boolean>(
    required?: Required
  ): Required extends true ? string : string | undefined {
    const account = this.session?.namespaces['bip122']?.accounts[0]
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
    if (!this.session?.namespaces['bip122']?.methods.includes(method)) {
      throw new Error(`Method ${method} is not supported`)
    }
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

  export type RequestMethods = {
    signMessage: Request<WCSignMessageParams, WCSignMessageResponse>
    sendTransfer: Request<WCSendTransferParams, WCSendTransferResponse>
    getAccountAddresses: Request<undefined, string[]>
  }

  export type RequestMethod = keyof RequestMethods
}
