import { getWallets } from '@wallet-standard/app'
import { WalletStandardProvider } from '../providers/WalletStandardProvider.js'
import { isWalletAdapterCompatibleStandardWallet } from '@solana/wallet-adapter-base'
import type { Wallet } from '@wallet-standard/base'

import type { CaipNetwork } from '@reown/appkit-common'

const { get, on } = getWallets()
let standardAdapters: WalletStandardProvider[] = []

export function watchStandard(
  requestedChains: CaipNetwork[],
  getActiveChain: () => CaipNetwork | undefined,
  callback: (...arg: WalletStandardProvider[]) => void
) {
  const listeners = [
    on('register', (...wallets) => {
      standardAdapters = [
        ...standardAdapters,
        ...wrapWalletsWithAdapters(wallets, requestedChains, getActiveChain)
      ]
      callback(...standardAdapters)
    }),
    on('unregister', (...wallets) => {
      standardAdapters = standardAdapters.filter(standardAdapter =>
        wallets.some(wallet => wallet.name === standardAdapter.wallet.name)
      )
      callback(...standardAdapters)
    })
  ]

  standardAdapters = wrapWalletsWithAdapters(get(), requestedChains, getActiveChain)

  callback(...standardAdapters)

  return () => listeners.forEach(off => off())
}

function wrapWalletsWithAdapters(
  wallets: readonly Wallet[],
  requestedChains: CaipNetwork[],
  getActiveChain: () => CaipNetwork | undefined
): WalletStandardProvider[] {
  return wallets.filter(isWalletAdapterCompatibleStandardWallet).map(
    wallet =>
      new WalletStandardProvider({
        wallet,
        requestedChains,
        getActiveChain
      })
  )
}
