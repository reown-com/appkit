'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { type AppKitNetwork, megaethTestnet } from '@reown/appkit/networks'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { WagmiTests } from '@/src/components/Wagmi/WagmiTests'
import { AppKitProvider } from '@/src/context/AppKitContext'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const queryClient = new QueryClient()

const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks: [megaethTestnet] as [AppKitNetwork, ...AppKitNetwork[]],
  projectId: ConstantsUtil.ProjectId
})

const config = {
  adapters: [wagmiAdapter],
  networks: [megaethTestnet] as [AppKitNetwork, ...AppKitNetwork[]],
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true
  },
  customWallets: ConstantsUtil.CustomWallets,
  // Backpack
  excludeWalletIds: ['2bd8c14e035c2d48f184aaa168559e86b0e3433228d3c4075900a221785019b0']
}
const wagmiConfig = wagmiAdapter.wagmiConfig

export default function Wagmi() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitProvider config={config}>
          <AppKitButtons />
          <AppKitInfo />
          <WagmiTests config={wagmiConfig} />
        </AppKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
