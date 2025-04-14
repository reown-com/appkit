/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */
import { type CaipNetwork, ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { CoreHelperUtil, type RequestArguments } from '@reown/appkit-controllers'
import { PresetsUtil } from '@reown/appkit-utils'
import { bitcoin } from '@reown/appkit/networks'

import { MethodNotSupportedError } from '../errors/MethodNotSupportedError.js'
import type { BitcoinConnector } from '../utils/BitcoinConnector.js'
import { ProviderEventEmitter } from '../utils/ProviderEventEmitter.js'
import { UnitsUtil } from '../utils/UnitsUtil.js'

export class OKXConnector extends ProviderEventEmitter implements BitcoinConnector {
  public readonly id = 'OKX'
  public readonly name = 'OKX Wallet'
  public readonly chain = 'bip122'
  public readonly type = 'ANNOUNCED'
  public readonly explorerId =
    PresetsUtil.ConnectorExplorerIds[CommonConstantsUtil.CONNECTOR_ID.OKX]
  public readonly imageUrl: string

  public readonly provider = this

  private readonly wallet: OKXConnector.Wallet
  private readonly requestedChains: CaipNetwork[] = []
  private readonly getActiveNetwork: () => CaipNetwork | undefined

  constructor({
    wallet,
    requestedChains,
    getActiveNetwork,
    imageUrl
  }: OKXConnector.ConstructorParams) {
    super()
    this.wallet = wallet
    this.requestedChains = requestedChains
    this.getActiveNetwork = getActiveNetwork
    this.imageUrl = imageUrl
  }

  public get chains() {
    return this.requestedChains.filter(chain => chain.caipNetworkId === bitcoin.caipNetworkId)
  }

  public async connect(): Promise<string> {
    const result = await this.wallet.connect()

    this.bindEvents()

    return result.address
  }

  public async disconnect(): Promise<void> {
    this.unbindEvents()
    await this.wallet.disconnect()
  }

  public async getAccountAddresses(): Promise<BitcoinConnector.AccountAddress[]> {
    const accounts = await this.wallet.getAccounts()
    const publicKeyOfActiveAccount = await this.wallet.getPublicKey()

    const accountList = accounts.map(account => ({
      address: account,
      purpose: 'payment' as const,
      publicKey: publicKeyOfActiveAccount
    }))

    return accountList
  }

  public async signMessage(params: BitcoinConnector.SignMessageParams): Promise<string> {
    const protocol = params.protocol === 'bip322' ? 'bip322-simple' : params.protocol

    return this.wallet.signMessage(params.message, protocol)
  }

  public async sendTransfer(params: BitcoinConnector.SendTransferParams): Promise<string> {
    const network = this.getActiveNetwork()

    if (!network) {
      throw new Error('No active network available')
    }

    const from = (await this.wallet.getAccounts())[0]

    if (!from) {
      throw new Error('No account available')
    }

    const result = await this.wallet.send({
      from,
      to: params.recipient,
      value: UnitsUtil.parseSatoshis(params.amount, network)
    })

    return result.txhash
  }

  public async signPSBT(
    params: BitcoinConnector.SignPSBTParams
  ): Promise<BitcoinConnector.SignPSBTResponse> {
    const psbtHex = Buffer.from(params.psbt, 'base64').toString('hex')

    const signedPsbtHex = await this.wallet.signPsbt(psbtHex)

    let txid: string | undefined = undefined
    if (params.broadcast) {
      txid = await this.wallet.pushPsbt(signedPsbtHex)
    }

    return {
      psbt: Buffer.from(signedPsbtHex, 'hex').toString('base64'),
      txid
    }
  }

  public async switchNetwork(_caipNetworkId: string): Promise<void> {
    throw new Error(`${this.name} wallet does not support network switching`)
  }

  public request<T>(_args: RequestArguments): Promise<T> {
    return Promise.reject(new MethodNotSupportedError(this.id, 'request'))
  }

  private bindEvents(): void {
    this.unbindEvents()

    this.wallet.on('accountChanged', account => {
      if (typeof account === 'object' && account && 'address' in account) {
        this.emit('accountsChanged', [account.address])
      }
    })
    this.wallet.on('disconnect', () => {
      this.emit('disconnect')
    })
  }

  private unbindEvents(): void {
    this.wallet.removeAllListeners()
  }

  public static getWallet(params: OKXConnector.GetWalletParams): OKXConnector | undefined {
    if (!CoreHelperUtil.isClient()) {
      return undefined
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const okxwallet = (window as any)?.okxwallet
    const wallet = okxwallet?.bitcoin
    /**
     * OKX doesn't provide a way to get the image URL specifally for bitcoin
     * so we use the icon for cardano as a fallback
     */
    const imageUrl = okxwallet?.cardano?.icon || ''

    if (wallet) {
      return new OKXConnector({ wallet, imageUrl, ...params })
    }

    return undefined
  }

  public async getPublicKey(): Promise<string> {
    return this.wallet.getPublicKey()
  }
}

export namespace OKXConnector {
  export type ConstructorParams = {
    wallet: Wallet
    requestedChains: CaipNetwork[]
    getActiveNetwork: () => CaipNetwork | undefined
    imageUrl: string
  }

  export type Wallet = {
    /*
     * This interface doesn't include all available methods
     * Reference: https://www.okx.com/web3/build/docs/sdks/chains/bitcoin/provider
     */
    connect(): Promise<{ address: string; publicKey: string }>
    disconnect(): Promise<void>
    getAccounts(): Promise<string[]>
    signMessage(signStr: string, type?: 'ecdsa' | 'bip322-simple'): Promise<string>
    signPsbt(psbtHex: string): Promise<string>
    pushPsbt(psbtHex: string): Promise<string>
    send(params: {
      from: string
      to: string
      value: string
      satBytes?: string
      memo?: string
      memoPos?: number
    }): Promise<{ txhash: string }>
    on(event: string, listener: (param?: unknown) => void): void
    removeAllListeners(): void
    getPublicKey(): Promise<string>
  }

  export type GetWalletParams = Omit<ConstructorParams, 'wallet' | 'imageUrl'>
}
