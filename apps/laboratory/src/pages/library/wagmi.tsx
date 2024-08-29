import { createWeb3Modal } from '@web3modal/base/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { AppKitButtons } from '../../components/AppKitButtons'
import { WagmiTests } from '../../components/Wagmi/WagmiTests'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { WagmiModalInfo } from '../../components/Wagmi/WagmiModalInfo'
import { mainnet, optimism, polygon, zkSync } from '../../utils/NetworksUtil'
import { EVMWagmiClient } from '@web3modal/base/adapters/evm/wagmi'

const queryClient = new QueryClient()

const wagmiAdapter = new EVMWagmiClient()

const modal = createWeb3Modal({
  adapters: [wagmiAdapter],
  caipNetworks: [polygon, mainnet, zkSync, optimism],
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true,
    socials: ['google', 'github', 'apple', 'x', 'farcaster', 'facebook', 'discord'],
    emailShowWallets: false
  },
  metadata: ConstantsUtil.Metadata
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
