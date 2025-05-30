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
  featuredWalletIds: [
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // Metamask
    '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // OKX 1
    '5d9f1395b3a8e848684848dc4147cbd05c8d54bb737eac78fe103901fe6b01a1' // OKX 2
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
