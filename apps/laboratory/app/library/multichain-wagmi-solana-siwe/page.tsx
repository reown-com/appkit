'use client'

import React from 'react'

import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { type AppKitNetwork, mainnet } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import InitializeBoundary from '@/src/components/InitializeBoundary'
import { SiweData } from '@/src/components/Siwe/SiweData'
import { SolanaTests } from '@/src/components/Solana/SolanaTests'
import { WagmiTests } from '@/src/components/Wagmi/WagmiTests'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'
import { siweConfig } from '@/src/utils/SiweUtils'
import { ThemeStore } from '@/src/utils/StoreUtil'

const queryClient = new QueryClient()

const networks = [...ConstantsUtil.EvmNetworks, ...ConstantsUtil.SolanaNetworks] as [
  AppKitNetwork,
  ...AppKitNetwork[]
]

const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks,
  projectId: ConstantsUtil.ProjectId
})

const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()]
})

const modal = createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  networks,
  defaultNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true
  },
  metadata: ConstantsUtil.Metadata,
  siweConfig
})

ThemeStore.setModal(modal)

export default function MultiChainWagmiSolana() {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <InitializeBoundary>
          <AppKitButtons />
          <AppKitInfo />
          <SiweData />
          <WagmiTests />
          <SolanaTests />
        </InitializeBoundary>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
