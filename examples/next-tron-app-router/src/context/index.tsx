'use client'

import React, { type ReactNode } from 'react'

import { BinanceWalletAdapter } from '@tronweb3/tronwallet-adapter-binance'
import { BitKeepAdapter } from '@tronweb3/tronwallet-adapter-bitkeep'
import { MetaMaskAdapter } from '@tronweb3/tronwallet-adapter-metamask-tron'
import { OkxWalletAdapter } from '@tronweb3/tronwallet-adapter-okxwallet'
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapter-tronlink'
import { TrustAdapter } from '@tronweb3/tronwallet-adapter-trust'
import { ThemeProvider } from 'next-themes'

import { TronAdapter } from '@reown/appkit-adapter-tron'
import { ReownTronAdapter } from '@reown/appkit-adapter-tron/testing'
import { createAppKit } from '@reown/appkit/react'

import { networks, projectId } from '@/config'

if (!projectId) {
  throw new Error('Project ID is not defined')
}

const tronAdapter = new TronAdapter({
  walletAdapters: [
    new ReownTronAdapter(),
    new TronLinkAdapter({ openUrlWhenWalletNotFound: false, checkTimeout: 3000 }),
    new TrustAdapter(),
    new BitKeepAdapter(),
    new BinanceWalletAdapter(),
    new OkxWalletAdapter({ openUrlWhenWalletNotFound: false }),
    new MetaMaskAdapter()
  ]
})

createAppKit({
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

function ContextProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </ThemeProvider>
  )
}

export default ContextProvider
