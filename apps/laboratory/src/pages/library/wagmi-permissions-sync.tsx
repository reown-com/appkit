import { createWeb3Modal } from '@rerock/appkit/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { AppKitButtons } from '../../components/AppKitButtons'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { WagmiPermissionsSyncTest } from '../../components/Wagmi/WagmiPermissionsSyncTest'
import { arbitrum, mainnet, optimism, polygon, zkSync, sepolia } from '@rerock/appkit/chains'
import { EVMWagmiClient } from '@rerock/appkit-adapter-wagmi'
import { PasskeyProvider } from '../../context/PasskeyContext'
import { ERC7715PermissionsProvider } from '../../context/ERC7715PermissionsContext'

const queryClient = new QueryClient()

const networks = [mainnet, optimism, polygon, zkSync, arbitrum, sepolia]

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
          <PasskeyProvider>
            <AppKitButtons />
            <WagmiPermissionsSyncTest />
          </PasskeyProvider>
        </ERC7715PermissionsProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
