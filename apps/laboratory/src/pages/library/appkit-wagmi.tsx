import { createAppKit } from '@web3modal/appkit/react'
import { EVMWagmiClient } from '@web3modal/appkit/adapters/evm/wagmi'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { AppKitButtons } from '../../components/AppKitButtons'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getWagmiConfig } from '../../utils/WagmiConstants'
import { WagmiProvider } from 'wagmi'
import { AppKitInfo } from '../../components/AppKitInfo'

const queryClient = new QueryClient()

const wagmiConfig = getWagmiConfig('default')

const wagmiAdapter = new EVMWagmiClient({
  wagmiConfig
})

const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId: ConstantsUtil.ProjectId,
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
  customWallets: ConstantsUtil.CustomWallets,
  sdkType: 'w3m',
  sdkVersion: 'html-wagmi-1.0.0'
})

ThemeStore.setModal(modal)

export default function AppKitWagmi() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitButtons />
        <AppKitInfo />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
