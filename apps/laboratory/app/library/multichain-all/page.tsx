'use client'

import React, { useEffect } from 'react'

import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'

import { AppKitButtonsMultiChain } from '@/src/components/AppKitButtonsMultiChain'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { AppKitInfoMultiChain } from '@/src/components/AppKitInfoMultiChain'
import { BitcoinTests } from '@/src/components/Bitcoin/BitcoinTests'
import { SolanaTests } from '@/src/components/Solana/SolanaTests'
import { WagmiTests } from '@/src/components/Wagmi/WagmiTests'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'
import { ThemeStore } from '@/src/utils/StoreUtil'

const queryClient = new QueryClient()

const networks = ConstantsUtil.AllNetworks

const wagmiAdapter = new WagmiAdapter({
  ssr: false,
  networks,
  projectId: ConstantsUtil.ProjectId
})

const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()]
})

const bitcoinAdapter = new BitcoinAdapter()

const modal = createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter, bitcoinAdapter],
  networks,
  defaultNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true
  },
  metadata: ConstantsUtil.Metadata
})

ThemeStore.setModal(modal)

export default function Page() {
  // Only way I was able to remove the SSR errors, for some reason its still being rendered on the server even with 'use client'
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  useEffect(() => () => {}, [])

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitButtonsMultiChain />
        <AppKitInfoMultiChain />
        <AppKitInfo />
        <WagmiTests />
        <SolanaTests />
        <BitcoinTests />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
