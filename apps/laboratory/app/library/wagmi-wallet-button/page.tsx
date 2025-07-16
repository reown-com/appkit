'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { AppKitWalletButtons } from '@/src/components/AppKitWalletButtons'
import InitializeBoundary from '@/src/components/InitializeBoundary'
import { AppKitProvider } from '@/src/context/AppKitContext'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const queryClient = new QueryClient()

const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks: ConstantsUtil.EvmNetworks,
  projectId: ConstantsUtil.ProjectId
})

const config = {
  adapters: [wagmiAdapter],
  networks: ConstantsUtil.EvmNetworks,
  projectId: ConstantsUtil.ProjectId
}

export default function Wagmi() {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitProvider config={config}>
          <InitializeBoundary>
            <AppKitButtons />
            <AppKitInfo />
            <AppKitWalletButtons
              wallets={[
                ...ConstantsUtil.EvmWalletButtons,
                ...ConstantsUtil.Socials,
                ConstantsUtil.Email
              ]}
            />
          </InitializeBoundary>
        </AppKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
