import { createAppKit } from '@reown/appkit/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { AppKitButtons } from '../../components/AppKitButtons'
import { WagmiTests } from '../../components/Wagmi/WagmiTests'
import { ThemeStore } from '../../utils/StoreUtil'
import { SiweData } from '../../components/Siwe/SiweData'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { siweConfig } from '../../utils/SiweUtils'
import { WagmiModalInfo } from '../../components/Wagmi/WagmiModalInfo'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet } from '@reown/appkit/networks'

const queryClient = new QueryClient()

const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks: ConstantsUtil.EvmNetworks,
  projectId: ConstantsUtil.ProjectId
})

const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: ConstantsUtil.EvmNetworks,
  featuredWalletIds: [
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa' // Coinbase Wallet
  ],
  defaultNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true
  },
  siweConfig
})

ThemeStore.setModal(modal)

export default function Wagmi() {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
      <h1>Wagmi</h1>
        <AppKitButtons />
        <WagmiModalInfo />
        <SiweData />
        <WagmiTests />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
