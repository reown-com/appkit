import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { AppKitButtons } from '../../components/AppKitButtons'
import { WagmiTests } from '../../components/Wagmi/WagmiTests'
import { WagmiModalInfo } from '../../components/Wagmi/WagmiModalInfo'
import { EVMWagmiClient } from '@rerock/adapter-wagmi'
import { createWeb3Modal } from '@rerock/base/react'
import { arbitrum, mainnet, optimism, polygon, zkSync } from '@rerock/base/chains'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { ThemeStore } from '../../utils/StoreUtil'

const queryClient = new QueryClient()
const wagmiAdapter = new EVMWagmiClient({
  ssr: true
})

const modal = createWeb3Modal({
  adapters: [wagmiAdapter],
  caipNetworks: [mainnet, optimism, polygon, zkSync, arbitrum],
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'github', 'apple', 'discord']
  }
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
        <WagmiTests />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
