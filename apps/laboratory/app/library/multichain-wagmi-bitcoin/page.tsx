'use client'

import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { type AppKitNetwork, mainnet } from '@reown/appkit/networks'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitConnections } from '@/src/components/AppKitConnections'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { BitcoinTests } from '@/src/components/Bitcoin/BitcoinTests'
import InitializeBoundary from '@/src/components/InitializeBoundary'
import { WagmiTests } from '@/src/components/Wagmi/WagmiTests'
import { AppKitProvider } from '@/src/context/AppKitContext'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const queryClient = new QueryClient()

const networks = [...ConstantsUtil.EvmNetworks, ...ConstantsUtil.BitcoinNetworks] as [
  AppKitNetwork,
  ...AppKitNetwork[]
]

const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks,
  projectId: ConstantsUtil.ProjectId
})

const bitcoinAdapter = new BitcoinAdapter()

const config = {
  adapters: [wagmiAdapter, bitcoinAdapter],
  networks,
  defaultNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId,

  metadata: ConstantsUtil.Metadata
}

export default function MultiChainWagmiSolana() {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitProvider config={config}>
          <InitializeBoundary>
            <AppKitButtons />
            <AppKitConnections namespace="eip155" title="EVM Connections" />
            <AppKitConnections namespace="bip122" title="Bitcoin Connections" />
            <AppKitInfo />
            <WagmiTests />
            <BitcoinTests />
          </InitializeBoundary>
        </AppKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
