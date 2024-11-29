'use client'

import { ReactNode } from 'react'
import { createAppKit } from '@reown/appkit/react'
import { AppKitNetwork, mainnet, solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks'
import { BaseWalletAdapter, SolanaAdapter } from '@reown/appkit-adapter-solana'
import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error('Project ID is not defined')
}

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [solana, solanaTestnet, solanaDevnet]

const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()] as BaseWalletAdapter[]
})

// Set up metadata
export const metadata = {
  name: 'next-reown-appkit',
  description: 'next-reown-appkit',
  url: 'https://reown.com/appkit',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// Create the modal
export const modal = createAppKit({
  adapters: [solanaWeb3JsAdapter],
  projectId,
  networks,
  defaultNetwork: mainnet,
  metadata,
  themeMode: 'light',
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

function ContextProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export default ContextProvider
