import { getWallets } from '@wallet-standard/app'
import type { BitcoinConnector } from '../utils/BitcoinConnector.js'
import type { Wallet } from '@wallet-standard/base'
import type { CaipNetwork } from '@reown/appkit-common'

export class WalletStandardConnector implements BitcoinConnector {
  public readonly chain = 'bip122'
  public readonly type = 'EXTERNAL'

  readonly wallet: Wallet

  constructor({ wallet }: WalletStandardConnector.ConstructorParams) {
    this.wallet = wallet
  }

  public get id(): string {
    return this.wallet.name
  }

  public get chains(): CaipNetwork[] {
    return []
  }

  async getAccountAddresses(): Promise<BitcoinConnector.AccountAddress[]> {
    return Promise.resolve([])
  }

  public static watchWallets({ callback }: WalletStandardConnector.WatchWalletsParams) {
    const { get, on } = getWallets()

    function wrapWallet(wallet: Wallet) {
      return new WalletStandardConnector({ wallet })
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
  }

  export type WatchWalletsParams = {
    callback: (...connectors: WalletStandardConnector[]) => void
  }
}
