'use client'

import { HuobiWalletAdapter } from '@solana/wallet-adapter-wallets'
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
import { AppKitPay } from '@/src/components/AppKitPay'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const queryClient = new QueryClient()

const networks = ConstantsUtil.AllNetworks

const wagmiAdapter = new WagmiAdapter({
  ssr: false,
  networks,
  projectId: ConstantsUtil.ProjectId
})
const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new HuobiWalletAdapter()]
})

const bitcoinAdapter = new BitcoinAdapter()

createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter, bitcoinAdapter],
  networks,
  defaultNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true,
    pay: true
  },
  metadata: ConstantsUtil.Metadata
})

export default function Page() {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitButtonsMultiChain />
        <AppKitInfoMultiChain />
        <AppKitInfo />
        <AppKitPay />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
