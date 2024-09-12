import React from 'react'
import { createWeb3Modal } from '@reown/appkit/react'
import { EVMWagmiClient } from '@reown/appkit-adapter-wagmi'
import { SolanaWeb3JsClient } from '@reown/appkit-adapter-solana/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import {
  arbitrum,
  mainnet,
  polygon,
  base,
  binanceSmartChain,
  solana,
  solanaTestnet,
  solanaDevnet,
  optimism,
  zkSync,
  sepolia
} from '@reown/appkit/chains'
import { AppKitButtons } from '../../components/AppKitButtons'
import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { MultiChainTestsWagmiSolana } from '../../components/MultiChainTestsWagmiSolana'
import { MultiChainInfo } from '../../components/MultiChainInfo'
import { siweConfig } from '../../utils/SiweUtils'

const queryClient = new QueryClient()

const networks = [mainnet, optimism, polygon, zkSync, arbitrum, sepolia]

const wagmiAdapter = new EVMWagmiClient({
  ssr: true,
  caipNetworks: networks,
  projectId: ConstantsUtil.ProjectId
})

const solanaWeb3JsAdapter = new SolanaWeb3JsClient({
  wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()]
})

const modal = createWeb3Modal({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  caipNetworks: [
    mainnet,
    polygon,
    base,
    binanceSmartChain,
    arbitrum,
    solana,
    solanaTestnet,
    solanaDevnet
  ],
  defaultCaipNetwork: mainnet,
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
        <AppKitButtons />
        <MultiChainInfo />
        <MultiChainTestsWagmiSolana />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
