import { getWallets } from '@wallet-standard/app'
import type { BitcoinConnector } from '../utils/BitcoinConnector.js'
import type { Wallet } from '@wallet-standard/base'
import type { CaipNetwork } from '@reown/appkit-common'

export class WalletStandardConnector implements BitcoinConnector {
  public readonly chain = 'bip122'
  public readonly type = 'ANNOUNCED'

  readonly wallet: Wallet
  private requestedChains: CaipNetwork[] = []

  constructor({ wallet, requestedChains }: WalletStandardConnector.ConstructorParams) {
    this.wallet = wallet
    this.requestedChains = requestedChains
  }

  public get id(): string {
    return this.wallet.name
  }

  public get chains() {
    return this.wallet.chains
      .map(chainId => this.requestedChains.find(chain => chain.id === chainId))
      .filter(Boolean) as CaipNetwork[]
  }

  async getAccountAddresses(): Promise<BitcoinConnector.AccountAddress[]> {
    return Promise.resolve([])
  }

  public static watchWallets({
    callback,
    requestedChains
  }: WalletStandardConnector.WatchWalletsParams) {
    const { get, on } = getWallets()

    function wrapWallet(wallet: Wallet) {
      return new WalletStandardConnector({ wallet, requestedChains })
    }

    const listeners = [
      on('register', (...wallets) => {
        callback(...wallets.map(wrapWallet))
      }),
      on('unregister', (...wallets) => {
        callback(...wallets.map(wrapWallet))
      })
    ]

    callback(...get().map(wrapWallet))

    return () => listeners.forEach(off => off())
  }
}

export namespace WalletStandardConnector {
  export type ConstructorParams = {
    wallet: Wallet
    requestedChains: CaipNetwork[]
  }

  export type WatchWalletsParams = {
    callback: (...connectors: WalletStandardConnector[]) => void
    requestedChains: CaipNetwork[]
  }
}
