import { type CaipNetwork, ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { CoreHelperUtil, type RequestArguments } from '@reown/appkit-controllers'
import { PresetsUtil } from '@reown/appkit-utils'
import { bitcoin } from '@reown/appkit/networks'

import { MethodNotSupportedError } from '../errors/MethodNotSupportedError.js'
import type { BitcoinConnector } from '../utils/BitcoinConnector.js'
import { ProviderEventEmitter } from '../utils/ProviderEventEmitter.js'

export class BitgetConnector extends ProviderEventEmitter implements BitcoinConnector {
  public readonly id = 'Bitget'
  public readonly name = 'Bitget Wallet'
  public readonly chain = 'bip122'
  public readonly type = 'ANNOUNCED'
  public readonly explorerId =
    PresetsUtil.ConnectorExplorerIds[CommonConstantsUtil.CONNECTOR_ID.BITGET]
  public readonly imageUrl: string

  public readonly provider = this

  private readonly wallet: BitgetConnector.Wallet
  private readonly requestedChains: CaipNetwork[] = []
  private readonly getActiveNetwork: () => CaipNetwork | undefined

  constructor({
    wallet,
    requestedChains,
    getActiveNetwork,
    imageUrl
  }: BitgetConnector.ConstructorParams) {
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
    const [address] = await this.wallet.requestAccounts()

    if (!address) {
      throw new Error('No account available')
    }

    this.bindEvents()

    return address
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
    return this.wallet.signMessage(params.message)
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

    const txId = await this.wallet.sendBitcoin(params.recipient, params.amount)

    return txId
  }

  public async signPSBT(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _params: BitcoinConnector.SignPSBTParams
  ): Promise<BitcoinConnector.SignPSBTResponse> {
    // There is an issue with signing psbt with bitget wallet
    return Promise.reject(new MethodNotSupportedError(this.id, 'signPSBT'))
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

  public static getWallet(params: BitgetConnector.GetWalletParams): BitgetConnector | undefined {
    if (!CoreHelperUtil.isClient()) {
      return undefined
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bitkeep = (window as any)?.bitkeep
    const wallet = bitkeep?.unisat

    /**
     * Bitget doesn't provide a way to get the image URL specifally for bitcoin
     * so we use the icon for cardano as a fallback
     */
    const imageUrl = bitkeep?.suiWallet?.icon || ''

    if (wallet) {
      return new BitgetConnector({ wallet, imageUrl, ...params })
    }

    return undefined
  }

  public async getPublicKey(): Promise<string> {
    return this.wallet.getPublicKey()
  }
}

export namespace BitgetConnector {
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
    requestAccounts(): Promise<string[]>
    disconnect(): Promise<void>
    getAccounts(): Promise<string[]>
    pushPsbt(psbtHex: string): Promise<string>
    signMessage(signStr: string, type?: 'ecdsa' | 'bip322-simple'): Promise<string>
    signPsbt(
      psbtHex: string,
      params: {
        toSignInputs: {
          index: number
          address: string
          sighashTypes: number[]
        }[]
      }
    ): Promise<string>
    sendBitcoin(toAddress: string, amount: string): Promise<string>
    on(event: string, listener: (param?: unknown) => void): void
    removeAllListeners(): void
    getPublicKey(): Promise<string>
  }

  export type GetWalletParams = Omit<ConstructorParams, 'wallet' | 'imageUrl'>
}
