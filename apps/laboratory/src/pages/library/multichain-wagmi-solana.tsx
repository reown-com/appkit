import React from 'react'
import { createWeb3Modal } from '@web3modal/base/react'
import { EVMWagmiClient } from '@web3modal/adapter-wagmi'
import { SolanaWeb3JsClient } from '@web3modal/adapter-solana/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { arbitrum, mainnet, polygon, base, binanceSmartChain, solana } from '@web3modal/base/chains'
import { AppKitButtons } from '../../components/AppKitButtons'
import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { MultiChainTestsWagmiSolana } from '../../components/MultiChainTestsWagmiSolana'
import { MultiChainInfo } from '../../components/MultiChainInfo'
import { siweConfig } from '../../utils/SiweUtils'

const queryClient = new QueryClient()

const wagmiAdapter = new EVMWagmiClient()

const solanaWeb3JsAdapter = new SolanaWeb3JsClient({
  wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()]
})

const modal = createWeb3Modal({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  siweConfig,
  caipNetworks: [mainnet, polygon, base, binanceSmartChain, arbitrum, solana],
  defaultCaipNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true
  },
  metadata: ConstantsUtil.Metadata
})

ThemeStore.setModal(modal)

export default function MultiChainWagmiSolana() {
  if (!wagmiAdapter.wagmiConfig) {
    return null
  }

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitButtons />
        <MultiChainInfo />
        <MultiChainTestsWagmiSolana />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
