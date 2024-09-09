import { createWeb3Modal } from '@rerock/base/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { AppKitButtons } from '../../components/AppKitButtons'
import { WagmiTests } from '../../components/Wagmi/WagmiTests'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { arbitrum, mainnet, optimism, polygon, zkSync } from '@rerock/base/chains'
import { WagmiModalInfo } from '../../components/Wagmi/WagmiModalInfo'
import { EVMWagmiClient } from '@rerock/adapter-wagmi'

const queryClient = new QueryClient()

const networks = [mainnet, optimism, polygon, zkSync, arbitrum]

const wagmiAdapter = new EVMWagmiClient({
  ssr: true,
  caipNetworks: networks,
  projectId: ConstantsUtil.ProjectId
})

const modal = createWeb3Modal({
  adapters: [wagmiAdapter],
  caipNetworks: networks,
  defaultCaipNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true,
    email: true,
    socials: []
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
