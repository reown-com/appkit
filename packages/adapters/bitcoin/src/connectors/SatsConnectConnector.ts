import type { BitcoinConnector } from '../utils/BitcoinConnector.js'
import type { CaipNetwork } from '@reown/appkit-common'
import Wallet, {
  AddressPurpose,
  getProviders,
  type BtcRequestMethod,
  type BtcRequests,
  type Params,
  type Provider as SatsConnectProvider
} from 'sats-connect'
import type { RequestArguments } from '@reown/appkit-core'

export class SatsConnectConnector implements BitcoinConnector {
  public readonly chain = 'bip122'
  public readonly type = 'ANNOUNCED'

  readonly wallet: SatsConnectProvider
  readonly provider: BitcoinConnector

  private requestedChains: CaipNetwork[] = []

  constructor({ provider, requestedChains }: SatsConnectConnector.ConstructorParams) {
    this.wallet = provider
    this.requestedChains = requestedChains
    this.provider = this
  }

  public get id(): string {
    return this.name
  }

  public get name(): string {
    return this.wallet.name
  }

  public get imageUrl(): string {
    return this.wallet.icon || ''
  }

  public get chains() {
    return this.requestedChains
  }

  on<
    T extends keyof {
      connect: (connectParams: { chainId: number }) => void
      disconnect: (error: Error) => void
      display_uri: (uri: string) => void
      chainChanged: (chainId: string) => void
      accountsChanged: (accounts: string[]) => void
      message: (message: { type: string; data: unknown }) => void
    }
  >(
    event: T,
    listener: {
      connect: (connectParams: { chainId: number }) => void
      disconnect: (error: Error) => void
      display_uri: (uri: string) => void
      chainChanged: (chainId: string) => void
      accountsChanged: (accounts: string[]) => void
      message: (message: { type: string; data: unknown }) => void
    }[T]
  ): void {
    console.log(event, listener)
    throw new Error('Method not implemented.')
  }

  removeListener<T>(event: string, listener: (data: T) => void) {
    console.log(event, listener)
    throw new Error('Method not implemented.')
  }

  emit() {
    throw new Error('Method not implemented.')
  }

  async disconnect() {
    await Wallet.disconnect()
  }

  async request<T>(args: RequestArguments) {
    const info = await Wallet.request('getInfo', null)
    if (info.status === 'error') {
      throw new Error('Failed to get wallet info')
    }

    const methods = info.result.methods || []
    if (!methods.includes(args.method)) {
      throw new Error('Method not available')
    }

    return Wallet.request(args.method as BtcRequestMethod, args.params as Params<BtcRequests>) as T
  }

  async connect() {
    const addresses = await this.getAccountAddresses()

    if (addresses.length === 0) {
      throw new Error('No address available')
    }

    return addresses[0]?.address as string
  }

  async getAccountAddresses(): Promise<BitcoinConnector.AccountAddress[]> {
    const response = await Wallet.request('getAccounts', {
      purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals, AddressPurpose.Stacks],
      message: 'Connect to your wallet'
    })

    if (response.status === 'error') {
      throw new Error('User denied access to wallet')
    }

    if (response.result.length === 0) {
      throw new Error('No address available')
    }

    return response.result
  }

  public static getWallets({ requestedChains }: SatsConnectConnector.GetWalletsParams) {
    const providers = getProviders()

    return providers.map(provider => new SatsConnectConnector({ provider, requestedChains }))
  }

  public async signMessage(params: BitcoinConnector.SignMessageParams): Promise<string> {
    const res = await Wallet.request('signMessage', params)

    if (res.status === 'error') {
      throw new Error('Signature denied')
    }

    return res.result.signature
  }

  public async sendTransfer({
    amount,
    recipient
  }: BitcoinConnector.SendTransferParams): Promise<string> {
    const parsedAmount = isNaN(Number(amount)) ? 0 : Number(amount)
    const res = await Wallet.request('sendTransfer', {
      recipients: [{ address: recipient, amount: parsedAmount }]
    })

    if (res.status === 'error') {
      throw new Error('Transfer failed')
    }

    return res.result.txid
  }

  public async signPSBT(
    params: BitcoinConnector.SignPSBTParams
  ): Promise<BitcoinConnector.SignPSBTResponse> {
    const signInputs = params.signInputs.reduce<Record<string, number[]>>((acc, input) => {
      const currentIndexes = acc[input.address] || []
      currentIndexes.push(input.index)

      return { ...acc, [input.address]: currentIndexes }
    }, {})

    const res = await Wallet.request('signPsbt', {
      psbt: params.psbt,
      broadcast: params.broadcast,
      signInputs
    })

    if (res.status === 'error') {
      throw new Error('PSBT signing failed')
    }

    return res.result
  }
}

export namespace SatsConnectConnector {
  export type ConstructorParams = {
    provider: SatsConnectProvider
    requestedChains: CaipNetwork[]
  }

  export type GetWalletsParams = {
    requestedChains: CaipNetwork[]
  }
}
