import { createAppKit } from '@reown/appkit/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { AppKitButtons } from '../../components/AppKitButtons'
import { WagmiTests } from '../../components/Wagmi/WagmiTests'
import { ThemeStore } from '../../utils/StoreUtil'
import { arbitrum, mainnet, optimism, polygon, zkSync, sepolia } from '@reown/appkit/networks'
import { WagmiModalInfo } from '../../components/Wagmi/WagmiModalInfo'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

const queryClient = new QueryClient()

const networks = [mainnet, optimism, polygon, zkSync, arbitrum, sepolia]

const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks,
  projectId: ''
})

const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  defaultNetwork: mainnet,
  projectId: '',
  features: {
    analytics: true,
    socials: []
  },
  debug: true
})

ThemeStore.setModal(modal)

export default function Wagmi() {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitButtons />
        <WagmiModalInfo />
        <WagmiTests />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
