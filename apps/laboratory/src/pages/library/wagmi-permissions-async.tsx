import { createWeb3Modal } from '@rerock/base/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { AppKitButtons } from '../../components/AppKitButtons'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { WagmiPermissionsAsyncTest } from '../../components/Wagmi/WagmiPermissionsAsyncTest'
import { arbitrum, mainnet, optimism, polygon, zkSync, sepolia } from '@rerock/base/chains'
import { EVMWagmiClient } from '@rerock/adapter-wagmi'
import { ERC7715PermissionsProvider } from '../../context/ERC7715PermissionsContext'
import { LocalEcdsaKeyProvider } from '../../context/LocalEcdsaKeyContext'

const queryClient = new QueryClient()

const networks = [mainnet, optimism, polygon, zkSync, arbitrum]

const wagmiAdapter = new EVMWagmiClient({
  ssr: true,
  caipNetworks: networks,
  projectId: ConstantsUtil.ProjectId
})

const modal = createWeb3Modal({
  adapters: [wagmiAdapter],
  caipNetworks: networks,
  defaultCaipNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true
  },
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy'
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
