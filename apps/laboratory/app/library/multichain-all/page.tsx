'use client'

import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet } from '@reown/appkit/networks'

import { AppKitButtonsMultiChain } from '@/src/components/AppKitButtonsMultiChain'
import { AppKitConnections } from '@/src/components/AppKitConnections'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { AppKitInfoMultiChain } from '@/src/components/AppKitInfoMultiChain'
import { AppKitWalletButtons } from '@/src/components/AppKitWalletButtons'
import { BitcoinTests } from '@/src/components/Bitcoin/BitcoinTests'
import { SolanaTests } from '@/src/components/Solana/SolanaTests'
import { WagmiTests } from '@/src/components/Wagmi/WagmiTests'
import { AppKitProvider } from '@/src/context/AppKitContext'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const queryClient = new QueryClient()

const networks = ConstantsUtil.AllNetworks
const embeddedWalletOptions = [...ConstantsUtil.Socials, ConstantsUtil.Email]

const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks,
  projectId: ConstantsUtil.ProjectId
})

const solanaWeb3JsAdapter = new SolanaAdapter()

const bitcoinAdapter = new BitcoinAdapter()

const config = {
  adapters: [wagmiAdapter, solanaWeb3JsAdapter, bitcoinAdapter],
  networks,
  defaultNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata,
  customWallets: ConstantsUtil.CustomWallets
}

export default function Page() {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitProvider config={config}>
          <AppKitButtonsMultiChain />
          <AppKitInfoMultiChain />
          <AppKitConnections namespace="eip155" title="EVM Connections" />
          <AppKitConnections namespace="solana" title="Solana Connections" />
          <AppKitConnections namespace="bip122" title="Bitcoin Connections" />
          <AppKitInfo />
          <WagmiTests />
          <SolanaTests />
          <BitcoinTests />
          <AppKitWalletButtons
            title="EVM Wallet Buttons"
            namespace="eip155"
            wallets={[...ConstantsUtil.EvmWalletButtons, ...embeddedWalletOptions]}
          />
          <AppKitWalletButtons
            title="Solana Wallet Buttons"
            namespace="solana"
            wallets={[...ConstantsUtil.SolanaWalletButtons, ...embeddedWalletOptions]}
          />
          <AppKitWalletButtons
            title="Bitcoin Wallet Buttons"
            namespace="bip122"
            wallets={ConstantsUtil.BitcoinWalletButtons}
            showActions={false}
          />
        </AppKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
