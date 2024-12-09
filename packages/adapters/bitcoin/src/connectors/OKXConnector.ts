import type { CaipNetwork } from '@reown/appkit-common'
import type { BitcoinConnector } from '../utils/BitcoinConnector.js'
import { ProviderEventEmitter } from '../utils/ProviderEventEmitter.js'
import type { RequestArguments } from '@reown/appkit-core'
import { MethodNotSupportedError } from '../errors/MethodNotSupportedError.js'
import { bitcoin } from '@reown/appkit/networks'

export class OKXConnector extends ProviderEventEmitter implements BitcoinConnector {
  public readonly id = 'OKX'
  public readonly name = 'OKX Wallet'
  public readonly chain = 'bip122'
  public readonly type = 'ANNOUNCED'
  public readonly imageUrl =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJDSURBVHgB7Zq9jtpAEMfHlhEgQLiioXEkoAGECwoKxMcTRHmC5E3IoyRPkPAEkI7unJYmTgEFTYwA8a3NTKScLnCHN6c9r1e3P2llWQy7M/s1Gv1twCP0ej37dDq9x+Zut1t3t9vZjDEHIiSRSPg4ZpDL5fxkMvn1cDh8m0wmfugfO53OoFQq/crn8wxfY9EymQyrVCqMfHvScZx1p9ls3pFxXBy/bKlUipGPrVbLuQqAfsCliq3zl0H84zwtjQrOw4Mt1W63P5LvBm2d+Xz+YzqdgkqUy+WgWCy+Mc/nc282m4FqLBYL+3g8fjDxenq72WxANZbLJeA13zDX67UDioL5ybXwafMYu64Ltn3bdDweQ5R97fd7GyhBQMipx4POeEDHIu2LfDdBIGGz+hJ9CQ1ABjoA2egAZPM6AgiCAEQhsi/C4jHyPA/6/f5NG3Ks2+3CYDC4aTccDrn6ojG54MnEvG00GoVmWLIRNZ7wTCwDHYBsdACy0QHIhiuRETxlICWpMMhGZHmqS8qH6JLyGegAZKMDkI0uKf8X4SWlaZo+Pp1bRrwlJU8ZKLIvUjKh0WiQ3sRUbNVq9c5Ebew7KEo2m/1p4jJ4qAmDaqDQBzj5XyiAT4VCQezJigAU+IDU+z8vJFnGWeC+bKQV/5VZ71FV6L7PA3gg3tXrdQ+DgLhC+75Wq3no69P3MC0NFQpx2lL04Ql9gHK1bRDjsSBIvScBnDTk1WrlGIZBorIDEYJj+rhdgnQ67VmWRe0zlplXl81vcyEt0rSoYDUAAAAASUVORK5CYII='

  public readonly provider = this

  private readonly wallet: OKXConnector.Wallet
  private readonly requestedChains: CaipNetwork[] = []
  private readonly getActiveNetwork: () => CaipNetwork | undefined

  constructor({ wallet, requestedChains, getActiveNetwork }: OKXConnector.ConstructorParams) {
    super()
    this.wallet = wallet
    this.requestedChains = requestedChains
    this.getActiveNetwork = getActiveNetwork
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

    return accounts.map(account => ({
      address: account,
      purpose: 'payment'
    }))
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

    const value = (Number(params.amount) / 10 ** network.nativeCurrency.decimals).toString()

    const result = await this.wallet.send({
      from,
      to: params.recipient,
      value
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wallet = (window as any)?.okxwallet?.bitcoin

    if (wallet) {
      return new OKXConnector({ wallet, ...params })
    }

    return undefined
  }
}

export namespace OKXConnector {
  export type ConstructorParams = {
    wallet: Wallet
    requestedChains: CaipNetwork[]
    getActiveNetwork: () => CaipNetwork | undefined
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
  }

  export type GetWalletParams = Omit<ConstructorParams, 'wallet'>
}
