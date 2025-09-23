import { TonConnect } from '@tonconnect/sdk'
import type { SendTransactionResponse, SignDataResponse, WalletInfo } from '@tonconnect/sdk'

import type { CaipNetwork } from '@reown/appkit-common'
import type { TonConnector } from '@reown/appkit-utils/ton'
import { TonConstantsUtil } from '@reown/appkit-utils/ton'

// assume type

export class TonConnectConnector implements TonConnector {
  id: string
  name: string
  chains: CaipNetwork[]
  // @ts-ignore
  type: string
  // @ts-ignore
  provider: TonConnect

  private wallet: WalletInfo

  constructor({ wallet, chains }: { wallet: WalletInfo; chains: CaipNetwork[] }) {
    this.wallet = wallet
    this.id = wallet.name.toLowerCase().replace(/\s+/g, '-')
    this.name = wallet.name
    this.chains = chains

    this.provider = new TonConnect({
      manifestUrl: 'https://your-dapp.com/tonconnect-manifest.json' // TODO: make configurable
    })
  }

  async connect(params?: { chainId?: string }): Promise<string> {
    const chainId = params?.chainId ?? this.chains[0]?.caipNetworkId
    const network = chainId === TonConstantsUtil.MAINNET ? 'mainnet' : 'testnet'

    const link = this.provider.connect(this.wallet)

    // TBD: Display custom QR with link or open universal link

    return new Promise((resolve, reject) => {
      const unsubscribe = this.provider.onStatusChange(status => {
        if (
          status &&
          status.connectItems &&
          status.connectItems.tonProof &&
          status.account.address
        ) {
          unsubscribe()
          resolve(status.account.address)
        } else {
          unsubscribe()
          reject('Cannot connect to wallet')
        }
      })
    })
  }

  async disconnect(): Promise<void> {
    if (this.provider) {
      await this.provider.disconnect()
    }
  }

  async getAccount(): Promise<string | undefined> {
    if (!this.provider) {
      throw new Error('Not connected')
    }

    return this.provider.account?.address
  }

  async signMessage(params: { message: string }): Promise<string> {
    if (!this.provider) {
      throw new Error('Not connected')
    }
    // Adjust to actual SDK method
    // @ts-ignore
    const response = await this.provider.signData({} as any) // or whatever
    return response.signature // Adjust
  }

  async sendTransaction(params: { transaction: any }): Promise<string> {
    if (!this.provider) {
      throw new Error('Not connected')
    }
    const response = await this.provider.sendTransaction(params.transaction)
    // @ts-ignore
    return response.boc // Assume it has an ID or hash
  }

  async signData(params: { data: any }): Promise<string> {
    if (!this.provider) {
      throw new Error('Not connected')
    }
    const response = await this.provider.signData(params.data)
    return response.signature // Adjust based on actual response structure
  }

  async switchNetwork(chainId: string): Promise<void> {
    // Update network if possible
    // May require reconnection
  }
}
