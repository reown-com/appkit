'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { type AppKitNetwork, mainnet, polygon } from '@reown/appkit/networks'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { WagmiTests } from '@/src/components/Wagmi/WagmiTests'
import { AppKitProvider } from '@/src/context/AppKitContext'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const queryClient = new QueryClient()

const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks: [mainnet, polygon] as [AppKitNetwork, ...AppKitNetwork[]],
  projectId: ConstantsUtil.ProjectId
})

const config = {
  adapters: [wagmiAdapter],
  networks: [mainnet, polygon] as [AppKitNetwork, ...AppKitNetwork[]],
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true
  },
  customWallets: ConstantsUtil.CustomWallets,
  // Rainbow then Metamask then others
  featuredWalletIds: [
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369',
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'
  ]
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
