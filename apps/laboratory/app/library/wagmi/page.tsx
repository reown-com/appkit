'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { immutableZkEvmTestnet } from 'viem/chains'
import { WagmiProvider } from 'wagmi'

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import type { AppKitNetwork } from '@reown/appkit-common'
import { createAppKit } from '@reown/appkit/react'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import InitializeBoundary from '@/src/components/InitializeBoundary'
import { WagmiTests } from '@/src/components/Wagmi/WagmiTests'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'
import { ThemeStore } from '@/src/utils/StoreUtil'

const networks = [...ConstantsUtil.EvmNetworks, immutableZkEvmTestnet] as [
  AppKitNetwork,
  ...AppKitNetwork[]
]

const queryClient = new QueryClient()

const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks,
  projectId: ConstantsUtil.ProjectId
})

const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true
  },
  customWallets: ConstantsUtil.CustomWallets
})

const config = wagmiAdapter.wagmiConfig
ThemeStore.setModal(modal)

export default function Wagmi() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <InitializeBoundary>
          <AppKitButtons />
          <AppKitInfo />
          <WagmiTests config={config} />
        </InitializeBoundary>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
