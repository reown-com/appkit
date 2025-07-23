'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitConnections } from '@/src/components/AppKitConnections'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { WagmiTests } from '@/src/components/Wagmi/WagmiTests'
import { AppKitProvider } from '@/src/context/AppKitContext'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const queryClient = new QueryClient()

const customRpcUrls = {
  'eip155:1': [{ url: 'https://ethereum-rpc.publicnode.com' }],
  'eip155:137': [{ url: 'https://polygon-bor-rpc.publicnode.com' }],
  'eip155:42161': [{ url: 'https://arbitrum-rpc.publicnode.com' }],
  'eip155:10': [{ url: 'https://optimism-rpc.publicnode.com' }],
  'eip155:100': [{ url: 'https://gnosis-rpc.publicnode.com' }],
  'eip155:8453': [{ url: 'https://base-rpc.publicnode.com' }]
}

const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks: ConstantsUtil.EvmNetworks,
  projectId: ConstantsUtil.ProjectId,
  customRpcUrls
})

const config = {
  adapters: [wagmiAdapter],
  networks: ConstantsUtil.EvmNetworks,
  projectId: ConstantsUtil.ProjectId,
  customWallets: ConstantsUtil.CustomWallets,
  customRpcUrls
}
const wagmiConfig = wagmiAdapter.wagmiConfig

export default function Wagmi() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitProvider config={config}>
          <AppKitButtons />
          <AppKitConnections namespace="eip155" />
          <AppKitInfo />
          <WagmiTests config={wagmiConfig} />
        </AppKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
