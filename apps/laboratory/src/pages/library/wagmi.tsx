import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { AppKitButtons } from '../../components/AppKitButtons'
import { WagmiTests } from '../../components/Wagmi/WagmiTests'
import { WagmiModalInfo } from '../../components/Wagmi/WagmiModalInfo'
import { EVMWagmiClient } from '@reown/appkit-adapter-wagmi'
import { createAppKit } from '@reown/appkit/react'
import { arbitrum, mainnet, optimism, polygon, zkSync, sepolia } from '@reown/appkit/chains'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { ThemeStore } from '../../utils/StoreUtil'

const queryClient = new QueryClient()

const networks = [mainnet, optimism, polygon, zkSync, arbitrum, sepolia]

const wagmiAdapter = new EVMWagmiClient({
  ssr: true,
  caipNetworks: networks,
  projectId: ConstantsUtil.ProjectId
})

const modal = createAppKit({
  adapters: [wagmiAdapter],
  caipNetworks: networks,
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'github', 'apple', 'discord']
  }
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
