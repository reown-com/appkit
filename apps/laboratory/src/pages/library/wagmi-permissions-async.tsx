import { createAppKit } from '@reown/appkit/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { AppKitButtons } from '../../components/AppKitButtons'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { WagmiPermissionsAsyncTest } from '../../components/Wagmi/WagmiPermissionsAsyncTest'
import { sepolia, baseSepolia, type AppKitNetwork } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { ERC7715PermissionsProvider } from '../../context/ERC7715PermissionsContext'
import { LocalEcdsaKeyProvider } from '../../context/LocalEcdsaKeyContext'

const queryClient = new QueryClient()

const networks = [baseSepolia, sepolia] as [AppKitNetwork, ...AppKitNetwork[]]

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
            <AppKitButtons />
            <WagmiPermissionsAsyncTest />
          </LocalEcdsaKeyProvider>
        </ERC7715PermissionsProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
