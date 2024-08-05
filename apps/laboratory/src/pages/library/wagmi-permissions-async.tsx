import { createWeb3Modal } from '@web3modal/wagmi/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { Web3ModalButtons } from '../../components/Web3ModalButtons'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { getWagmiConfig } from '../../utils/WagmiConstants'
import { WagmiPermissionsAsyncProvider } from '../../context/WagmiPermissionsAsyncContext'
import { WagmiPermissionsAsyncTest } from '../../components/Wagmi/WagmiPermissionsAsyncTest'

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
        <WagmiPermissionsAsyncProvider>
          <Web3ModalButtons />
          <WagmiPermissionsAsyncTest />
        </WagmiPermissionsAsyncProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
