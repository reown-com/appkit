/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */
import { type CaipNetwork, ConstantsUtil } from '@reown/appkit-common'
import { CoreHelperUtil, type RequestArguments } from '@reown/appkit-controllers'
import { bitcoin, bitcoinTestnet } from '@reown/appkit/networks'

import { MethodNotSupportedError } from '../errors/MethodNotSupportedError.js'
import type { BitcoinConnector } from '../utils/BitcoinConnector.js'
import { AddressPurpose } from '../utils/BitcoinConnector.js'
import { ProviderEventEmitter } from '../utils/ProviderEventEmitter.js'
import { UnitsUtil } from '../utils/UnitsUtil.js'

export class UnisatConnector extends ProviderEventEmitter implements BitcoinConnector {
  public id: UnisatConnector.Id
  public name
  public readonly chain = 'bip122'
  public readonly type = 'ANNOUNCED'
  public readonly imageUrl: string

  public readonly provider = this

  private readonly wallet: UnisatConnector.Wallet
  private readonly requestedChains: CaipNetwork[] = []
  private readonly getActiveNetwork: () => CaipNetwork | undefined

  constructor({
    id,
    name,
    wallet,
    requestedChains,
    getActiveNetwork,
    imageUrl
  }: UnisatConnector.ConstructorParams) {
    super()
    this.id = id
    this.name = name
    this.wallet = wallet
    this.requestedChains = requestedChains
    this.getActiveNetwork = getActiveNetwork
    this.imageUrl = imageUrl
  }

  public get chains() {
    if (this.id === 'unisat') {
      return this.requestedChains.filter(chain => chain.caipNetworkId === bitcoin.caipNetworkId)
    }

    return this.requestedChains.filter(
      chain => chain.chainNamespace === ConstantsUtil.CHAIN.BITCOIN
    )
  }

  public async connect(): Promise<string> {
    const [account] = await this.wallet.requestAccounts()

    if (!account) {
      throw new Error('No account found')
    }

    this.bindEvents()

    this.emit('accountsChanged', [account])

    return account
  }

  public async disconnect(): Promise<void> {
    this.unbindEvents()

    return Promise.resolve()
  }

  public async getAccountAddresses(): Promise<BitcoinConnector.AccountAddress[]> {
    const accounts = await this.wallet.requestAccounts()

    const publicKey = await this.wallet.getPublicKey()

    const accountList = accounts.map(account => ({
      address: account,
      purpose: AddressPurpose.Payment,
      publicKey
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

    const result = await this.wallet.sendBitcoin(
      params.recipient,
      Number(UnitsUtil.parseSatoshis(params.amount, network))
    )

    return result
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

  public async switchNetwork(caipNetworkId: string): Promise<void> {
    const network = this.getNetwork(caipNetworkId)

    await this.wallet.switchChain(network)
  }

  public request<T>(_args: RequestArguments): Promise<T> {
    return Promise.reject(new MethodNotSupportedError(this.id, 'request'))
  }

  private bindEvents(): void {
    this.unbindEvents()

    this.wallet.on('accountsChanged', account => {
      if (typeof account === 'object' && account && 'address' in account) {
        this.emit('accountsChanged', [account.address])
      }
    })
  }

  private unbindEvents(): void {
    this.wallet.removeListener('accountsChanged', account => {
      if (typeof account === 'object' && account && 'address' in account) {
        this.emit('accountsChanged', [account.address])
      }
    })
  }

  public static getWallet(params: UnisatConnector.GetWalletParams): UnisatConnector | undefined {
    if (!CoreHelperUtil.isClient()) {
      return undefined
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, init-declarations
    let wallet: any

    switch (params.id) {
      case 'unisat':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        wallet = (window as any)?.unisat
        break
      case 'bitget':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        wallet = (window as any)?.bitkeep?.unisat
        break
      case 'binancew3w':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        wallet = (window as any)?.binancew3w?.bitcoin
        break
      default:
        throw new Error(`Unsupported wallet id: ${params.id}`)
    }

    if (wallet) {
      return new UnisatConnector({ wallet, imageUrl: '', ...params })
    }

    return undefined
  }

  public async getPublicKey(): Promise<string> {
    return this.wallet.getPublicKey()
  }

  private getNetwork(caipNetwork: string): UnisatConnector.Chain {
    switch (caipNetwork) {
      case bitcoin.caipNetworkId:
        return 'BITCOIN_MAINNET'
      case bitcoinTestnet.caipNetworkId:
        return 'BITCOIN_TESTNET'
      default:
        throw new Error('UnisatConnector: unsupported network')
    }
  }
}

export namespace UnisatConnector {
  export type Chain = 'BITCOIN_MAINNET' | 'BITCOIN_TESTNET' | 'FRACTAL_BITCOIN_MAINNET'
  export type Network = 'livenet' | 'testnet'
  export type Id = 'unisat' | 'bitget' | 'binancew3w'

  export type ConstructorParams = {
    id: Id
    name: string
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

    requestAccounts: () => Promise<string[]>
    getPublicKey: () => Promise<string>
    sendBitcoin: (
      to: string,
      value: number,
      options?: { feeRate: number; memo?: string; memos?: string[] }
    ) => Promise<string>
    signPsbt: (
      psbtHex: string,
      options?: {
        autoFinalized?: boolean
        toSignInputs: Array<
          | {
              index: number
              address: string
              sighashTypes?: number[]
              disableTweakSigner?: boolean
              useTweakedSigner?: boolean
            }
          | {
              index: number
              publicKey: string
              sighashTypes?: number[]
              disableTweakSigner?: boolean
              useTweakedSigner?: boolean
            }
        >
      }
    ) => Promise<string>
    switchChain(chain: Chain): Promise<{ enum: Chain; name: string; network: Network }>
    getAccounts(): Promise<string[]>
    signMessage(signStr: string, type?: 'ecdsa' | 'bip322-simple'): Promise<string>
    pushPsbt(psbtHex: string): Promise<string>
    on(event: string, listener: (param?: unknown) => void): void
    removeListener(event: string, listener: (param?: unknown) => void): void
  }

  export type GetWalletParams = Omit<ConstructorParams, 'wallet' | 'imageUrl'>
}
