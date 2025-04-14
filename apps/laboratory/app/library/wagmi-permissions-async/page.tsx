'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { type AppKitNetwork, base, baseSepolia, sepolia } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import InitializeBoundary from '@/src/components/InitializeBoundary'
import { WagmiPermissionsAsyncTest } from '@/src/components/Wagmi/WagmiPermissionsAsyncTest'
import { ERC7715PermissionsProvider } from '@/src/context/ERC7715PermissionsContext'
import { LocalEcdsaKeyProvider } from '@/src/context/LocalEcdsaKeyContext'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'
import { ThemeStore } from '@/src/utils/StoreUtil'

const queryClient = new QueryClient()

const networks = [baseSepolia, sepolia, base] as [AppKitNetwork, ...AppKitNetwork[]]

const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks,
  projectId: ConstantsUtil.ProjectId
})

const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  defaultNetwork: sepolia,
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true,
    smartSessions: true
  },
  termsConditionsUrl: 'https://reown.com/terms-of-service',
  privacyPolicyUrl: 'https://reown.com/privacy-policy'
})

ThemeStore.setModal(modal)

export default function Wagmi() {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ERC7715PermissionsProvider>
          <LocalEcdsaKeyProvider>
            <InitializeBoundary>
              <AppKitButtons />
              <WagmiPermissionsAsyncTest />
            </InitializeBoundary>
          </LocalEcdsaKeyProvider>
        </ERC7715PermissionsProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
