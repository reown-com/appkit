import { createAppkit } from '@web3modal/scaffold'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { Web3ModalButtons } from '../../components/Web3ModalButtons'
import { WagmiTests } from '../../components/Wagmi/WagmiTests'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { WagmiModalInfo } from '../../components/Wagmi/WagmiModalInfo'
import { EVMWagmiClient, defaultWagmiConfig } from '@web3modal/adapters'

const queryClient = new QueryClient()

import '@web3modal/polyfills'

import { mainnet, sepolia } from 'wagmi/chains'

const config = defaultWagmiConfig({
  chains: [mainnet, sepolia],
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata,
  ssr: true
})

const wagmiAdapter = new EVMWagmiClient({
  wagmiConfig: config
})

const modal = createAppkit({
  projectId: ConstantsUtil.ProjectId,
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
  customWallets: ConstantsUtil.CustomWallets,
  enableOnramp: true,
  adapters: [wagmiAdapter]
})

ThemeStore.setModal(modal)

export default function Wagmi() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Web3ModalButtons />
        <WagmiModalInfo />
        <WagmiTests />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
