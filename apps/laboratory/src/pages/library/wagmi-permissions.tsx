import { createWeb3Modal } from '@web3modal/wagmi/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { Web3ModalButtons } from '../../components/Web3ModalButtons'
import { WagmiPermissionsTest } from '../../components/Wagmi/WagmiPermissionsTest'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { foundry, sepolia } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'
import { OPTIONAL_METHODS } from '@walletconnect/ethereum-provider'
import { GrantedPermissionsProvider } from '../../hooks/context/GrantedPermissionContext'

const queryClient = new QueryClient()

const connectors = [
  walletConnect({
    projectId: ConstantsUtil.ProjectId,
    metadata: ConstantsUtil.Metadata,
    showQrModal: false,
    // @ts-expect-error: Overridding optionalMethods
    optionalMethods: [...OPTIONAL_METHODS, 'wallet_grantPermissions']
  })
]
const wagmiConfig = createConfig({
  chains: [foundry, sepolia],
  connectors,
  transports: {
    11155111: http(),
    31337: http()
  }
})

const modal = createWeb3Modal({
  wagmiConfig,
  projectId: ConstantsUtil.ProjectId,
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy'
})

ThemeStore.setModal(modal)

export default function Wagmi() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <GrantedPermissionsProvider>
          <Web3ModalButtons />
          <WagmiPermissionsTest />
        </GrantedPermissionsProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
