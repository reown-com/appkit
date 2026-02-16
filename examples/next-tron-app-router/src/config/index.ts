'use client'

import { BinanceWalletAdapter } from '@tronweb3/tronwallet-adapter-binance'
import { BitKeepAdapter } from '@tronweb3/tronwallet-adapter-bitkeep'
import { MetaMaskAdapter } from '@tronweb3/tronwallet-adapter-metamask-tron'
import { OkxWalletAdapter } from '@tronweb3/tronwallet-adapter-okxwallet'
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapter-tronlink'
import { TrustAdapter } from '@tronweb3/tronwallet-adapter-trust'

import { TronAdapter } from '@reown/appkit-adapter-tron'
import { ReownTronAdapter } from '@reown/appkit-adapter-tron/testing'
import { AppKitNetwork, tronMainnet, tronShastaTestnet } from '@reown/appkit/networks'
import {
  createAppKit,
  useAppKit,
  useAppKitAccount,
  useAppKitEvents,
  useAppKitNetwork,
  useAppKitState,
  useAppKitTheme,
  useDisconnect,
  useWalletInfo
} from '@reown/appkit/react'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

export const networks = [tronMainnet, tronShastaTestnet] as [AppKitNetwork, ...AppKitNetwork[]]

export const tronAdapter = new TronAdapter({
  walletAdapters: [
    new ReownTronAdapter(), // Reown extension
    new TronLinkAdapter({ openUrlWhenWalletNotFound: false, checkTimeout: 3000 }),
    new TrustAdapter(),
    new BitKeepAdapter(),
    new BinanceWalletAdapter(),
    new OkxWalletAdapter({ openUrlWhenWalletNotFound: false }),
    new MetaMaskAdapter()
  ]
})

// Create modal
const modal = createAppKit({
  adapters: [tronAdapter],
  networks,
  metadata: {
    name: 'AppKit Next.js TRON',
    description: 'AppKit Next.js App Router with TRON Adapter',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  },
  projectId,
  themeMode: 'light'
})

export {
  modal,
  useAppKit,
  useAppKitState,
  useAppKitTheme,
  useAppKitEvents,
  useAppKitAccount,
  useWalletInfo,
  useAppKitNetwork,
  useDisconnect
}
