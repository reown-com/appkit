import { createWeb3Modal } from '@web3modal/base/react'
import { EVMWagmiClient } from '@web3modal/base/adapters/evm/wagmi'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { WagmiProvider } from 'wagmi'
import { AppKitButtons } from '../../components/AppKitButtons'
import { WagmiModalInfo } from '../../components/Wagmi/WagmiModalInfo'
import { arbitrum, mainnet, optimism } from '../../utils/NetworksUtil'
import { WagmiTests } from '../../components/Wagmi/WagmiTests'

const queryClient = new QueryClient()

const wagmiAdapter = new EVMWagmiClient()

const modal = createWeb3Modal({
  adapters: [wagmiAdapter],
  caipNetworks: [mainnet, arbitrum, optimism],
  projectId: ConstantsUtil.ProjectId,
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy'
})

ThemeStore.setModal(modal)

export default function MultiChainWagmiAdapterOnly() {
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
