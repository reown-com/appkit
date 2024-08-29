import { createWeb3Modal } from '@web3modal/base/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { AppKitButtons } from '../../components/AppKitButtons'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { WagmiPermissionsAsyncProvider } from '../../context/WagmiPermissionsAsyncContext'
import { WagmiPermissionsAsyncTest } from '../../components/Wagmi/WagmiPermissionsAsyncTest'
import { mainnet, optimism, polygon, zkSync } from '../../utils/NetworksUtil'
import { EVMWagmiClient } from '@web3modal/adapter-wagmi'

const queryClient = new QueryClient()

const wagmiAdapter = new EVMWagmiClient()

const modal = createWeb3Modal({
  adapters: [wagmiAdapter],
  caipNetworks: [polygon, mainnet, zkSync, optimism],
  defaultCaipNetwork: polygon,
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true
  },
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy'
})

ThemeStore.setModal(modal)

export default function Wagmi() {
  if (!wagmiAdapter.wagmiConfig) {
    return null
  }

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiPermissionsAsyncProvider>
          <AppKitButtons />
          <WagmiPermissionsAsyncTest />
        </WagmiPermissionsAsyncProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
