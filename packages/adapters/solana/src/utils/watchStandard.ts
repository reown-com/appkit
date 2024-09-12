import { getWallets } from '@wallet-standard/app'
import { WalletStandardProvider } from '../providers/WalletStandardProvider.js'
import { isWalletAdapterCompatibleStandardWallet } from '@solana/wallet-adapter-base'
import type { Wallet } from '@wallet-standard/base'

import type { AppKit } from '@rerock/appkit'
import type { CaipNetwork } from '@rerock/appkit-common'

const { get, on } = getWallets()
let standardAdapters: WalletStandardProvider[] = wrapWalletsWithAdapters(get())

export function watchStandard(
  appKit: AppKit,
  caipNetwork: CaipNetwork,
  callback: (arg: WalletStandardProvider[]) => void
) {
  const listeners = [
    on('register', (...wallets) => {
      if (!standardAdapters || standardAdapters.length === 0) {
        standardAdapters = [...wrapWalletsWithAdapters(wallets, appKit, caipNetwork)]
      } else {
        standardAdapters = [
          ...standardAdapters,
          ...wrapWalletsWithAdapters(wallets, appKit, caipNetwork)
        ]
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

  standardAdapters = wrapWalletsWithAdapters(get(), appKit, caipNetwork)
  callback(standardAdapters)

  return () => listeners.forEach(off => off())
}

function wrapWalletsWithAdapters(
  wallets: readonly Wallet[],
  appKit?: AppKit,
  caipNetwork?: CaipNetwork
): WalletStandardProvider[] {
  if (appKit?.getCaipNetwork() || caipNetwork) {
    return wallets.filter(isWalletAdapterCompatibleStandardWallet).map(
      wallet =>
        new WalletStandardProvider({
          wallet,
          getActiveChain: () => appKit?.getCaipNetwork() ?? caipNetwork
        })
    )
  }

  return []
}
