import { createWeb3Modal } from '@web3modal/wagmi/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { Web3ModalButtons } from '../../components/Web3ModalButtons'
import { WagmiPermissionsTest } from '../../components/Wagmi/WagmiPermissionsTest'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { getWagmiConfig } from '../../utils/WagmiConstants'
import { WagmiPermissionsProvider } from '../../context/WagmiPermissionsContext'

const queryClient = new QueryClient()
const wagmiEmailConfig = getWagmiConfig('email')

const modal = createWeb3Modal({
  wagmiConfig: wagmiEmailConfig,
  projectId: ConstantsUtil.ProjectId,
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy'
})

ThemeStore.setModal(modal)

export default function Wagmi() {
  return (
    <WagmiProvider config={wagmiEmailConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiPermissionsProvider>
          <Web3ModalButtons />
          <WagmiPermissionsTest />
        </WagmiPermissionsProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
