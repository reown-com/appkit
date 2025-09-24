import { TonConnect } from '@tonconnect/sdk'
import type { WalletInfo } from '@tonconnect/sdk'

import type { CaipNetwork } from '@reown/appkit-common'
import type { TonConnector } from '@reown/appkit-utils/ton'

export class TonConnectConnector implements TonConnector {
  chains: CaipNetwork[]
  readonly chain = 'ton'
  readonly type = 'EXTERNAL'
  private client: TonConnect

  readonly wallet: WalletInfo

  constructor({ wallet, chains }: { wallet: WalletInfo; chains: CaipNetwork[] }) {
    console.log('[TonConnectConnector] constructor wallet', wallet)
    this.wallet = wallet
    this.chains = chains

    this.client = new TonConnect({})
    console.log('[TonConnectConnector] provider initialized')
  }

  public get id(): string {
    return this.name
  }

  public get name(): string {
    return this.wallet.name
  }

  public get explorerId(): string | undefined {
    return ''
  }

  public get imageUrl(): string {
    return this.wallet.imageUrl
  }

  async connect(): Promise<string> {
    console.log('[TonConnectConnector] connect: start')

    this.client.connect({
      // @ts-expect-error will fix
      bridgeUrl: this.wallet.bridgeUrl,
      // @ts-expect-error will fix
      jsBridgeKey: this.wallet.jsBridgeKey,
      // @ts-expect-error will fix
      universalLink: this.wallet.universalLink
    })

    return new Promise((resolve, reject) => {
      const unsubscribe = this.client.onStatusChange(status => {
        console.log('[TonConnectConnector] status change', status)
        if (status && status.account.address) {
          console.log('[TonConnectConnector] connected, address', status.account.address)
          unsubscribe()
          resolve(status.account.address)
        } else {
          console.log('[TonConnectConnector] connect: missing address in status')
          unsubscribe()
          reject('Cannot connect to wallet')
        }
      })
    })
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect()
    }
  }

  async getAccount(): Promise<string | undefined> {
    console.log('[TonConnectConnector] getAccount: called')
    if (!this.client) {
      throw new Error('Not connected')
    }

    return this.client.account?.address
  }

  async signMessage(): Promise<string> {
    console.log('[TonConnectConnector] signMessage: called')
    if (!this.client) {
      throw new Error('Not connected')
    }
    // Adjust to actual SDK method
    // @ts-ignore
    const response = await this.client.signData({} as any) // or whatever
    return response.signature // Adjust
  }

  async sendTransaction(params: { transaction: any }): Promise<string> {
    console.log('[TonConnectConnector] sendTransaction: called', params)
    if (!this.client) {
      throw new Error('TonConnector not found')
    }
    const response = await this.client.sendTransaction(params.transaction)
    // @ts-ignore
    return response.boc // Assume it has an ID or hash
  }

  async signData(params: { data: any }): Promise<string> {
    console.log('[TonConnectConnector] signData: called')
    if (!this.client) {
      throw new Error('TonConnector not found')
    }
    const response = await this.client.signData(params.data)
    return response.signature // Adjust based on actual response structure
  }

  async switchNetwork(): Promise<void> {}
}
