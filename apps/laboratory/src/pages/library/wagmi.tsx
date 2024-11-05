import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { AppKitButtons } from '../../components/AppKitButtons'
import { WagmiTests } from '../../components/Wagmi/WagmiTests'
import { WagmiModalInfo } from '../../components/Wagmi/WagmiModalInfo'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKit } from '@reown/appkit/react'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { ThemeStore } from '../../utils/StoreUtil'

const queryClient = new QueryClient()

const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks: ConstantsUtil.EvmNetworks,
  projectId: ConstantsUtil.ProjectId
})

const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: wagmiAdapter.caipNetworks,
  projectId: ConstantsUtil.ProjectId,
  termsConditionsUrl: 'https://www.reown.com/terms',
  privacyPolicyUrl: 'https://www.reown.com/privacy',
  featuredWalletIds: [
    'f2436c67184f158d1beda5df53298ee84abfc367581e4505134b5bcf5f46697d',
    'e9ff15be73584489ca4a66f64d32c4537711797e30b6660dbcb71ea72a42b1f4',
    'bc949c5d968ae81310268bf9193f9c9fb7bb4e1283e1284af8f2bd4992535fd6'
  ],
  enableLegalCheckbox: true,
  features: {
    analytics: true
  }
})

const config = wagmiAdapter.wagmiConfig
ThemeStore.setModal(modal)

export default function Wagmi() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppKitButtons />
        <WagmiModalInfo />
        <WagmiTests config={config} />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
