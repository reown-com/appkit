import { getWallets } from '@wallet-standard/app'
import { WalletStandardProvider } from '../providers'
import { isWalletAdapterCompatibleStandardWallet } from '@solana/wallet-adapter-base'
import type { Wallet } from '@wallet-standard/base'

const { get, on } = getWallets()

let standardAdapters: WalletStandardProvider[] = [...wrapWalletsWithAdapters(get())]

export function watchStandard(callback: (arg: WalletStandardProvider[]) => void) {
  const listeners = [
    on('register', (...wallets) => {
      if (!standardAdapters || standardAdapters.length === 0) {
        standardAdapters = [...wrapWalletsWithAdapters(wallets)]
      } else {
        standardAdapters = [...standardAdapters, ...wrapWalletsWithAdapters(wallets)]
      }
      callback(standardAdapters)
    }),
    on('unregister', (...wallets) => {
      standardAdapters = standardAdapters.filter(standardAdapter =>
        wallets.some(wallet => wallet.name === standardAdapter.wallet.name)
      )
      callback(standardAdapters)
    })
  ]

  callback(standardAdapters)

  return () => listeners.forEach(off => off())
}

function wrapWalletsWithAdapters(wallets: readonly Wallet[]): readonly WalletStandardProvider[] {
  return wallets
    .filter(isWalletAdapterCompatibleStandardWallet)
    .map(wallet => new WalletStandardProvider({ wallet }))
}
