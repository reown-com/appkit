import { createWeb3Modal } from '@web3modal/base/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { AppKitButtons } from '../../components/AppKitButtons'
import { WagmiTests } from '../../components/Wagmi/WagmiTests'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { SiweData } from '../../components/Siwe/SiweData'
import { siweConfig } from '../../utils/SiweUtils'
import { WagmiModalInfo } from '../../components/Wagmi/WagmiModalInfo'
import { mainnet, optimism, polygon, zkSync } from '../../utils/NetworksUtil'
import { EVMWagmiClient } from '@web3modal/adapter-wagmi'

const queryClient = new QueryClient()

const wagmiAdapter = new EVMWagmiClient()

const modal = createWeb3Modal({
  adapters: [wagmiAdapter],
  caipNetworks: [mainnet, optimism, polygon, zkSync],
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true
  },
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
  siweConfig,
  customWallets: ConstantsUtil.CustomWallets
})

ThemeStore.setModal(modal)

export default function Wagmi() {
  if (!wagmiAdapter.wagmiConfig) {
    return null
  }

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitButtons />
        <WagmiModalInfo />
        <SiweData />
        <WagmiTests />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
