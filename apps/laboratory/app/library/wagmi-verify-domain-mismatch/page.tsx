'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet } from '@reown/appkit/networks'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { WagmiTests } from '@/src/components/Wagmi/WagmiTests'
import { AppKitProvider } from '@/src/context/AppKitContext'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

// Special project ID with verify enabled on localhost
const projectId = 'e4eae1aad4503db9966a04fd045a7e4d'

const queryClient = new QueryClient()

const networks = ConstantsUtil.EvmNetworks

const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks,
  projectId
})

const config = {
  adapters: [wagmiAdapter],
  networks,
  defaultNetwork: mainnet,
  metadata: {
    name: 'AppKit',
    description: 'AppKit Laboratory',
    url: 'https://example.com',
    icons: []
  },
  projectId
}

export default function Wagmi() {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitProvider config={config}>
          <AppKitButtons />
          <AppKitInfo />
          <WagmiTests />
        </AppKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
