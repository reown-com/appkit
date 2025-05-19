'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { WagmiTests } from '@/src/components/Wagmi/WagmiTests'
import { AppKitProvider } from '@/src/context/AppKitContext'
import { useProjectId } from '@/src/hooks/useProjectId'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const queryClient = new QueryClient()

export default function Wagmi() {
  const { projectId, isProjectIdLoading } = useProjectId()

  if (isProjectIdLoading) {
    return <div>Loading project information...</div>
  }

  const wagmiAdapter = new WagmiAdapter({
    ssr: false,
    networks: ConstantsUtil.EvmNetworks,
    projectId: projectId || ConstantsUtil.ProjectId
  })

  const config = {
    adapters: [wagmiAdapter],
    networks: ConstantsUtil.EvmNetworks,
    projectId: projectId || ConstantsUtil.ProjectId,
    customWallets: ConstantsUtil.CustomWallets
  }
  const wagmiConfig = wagmiAdapter.wagmiConfig

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
