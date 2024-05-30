import { createAppkit } from '@web3modal/scaffold'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { Web3ModalButtons } from '../../components/Web3ModalButtons'
import { WagmiTests } from '../../components/Wagmi/WagmiTests'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { solana, solanaDevnet, solanaTestnet } from '../../utils/ChainsUtil'
import { WagmiModalInfo } from '../../components/Wagmi/WagmiModalInfo'
import {
  EVMWagmiClient,
  defaultWagmiConfig,
  SolanaWeb3JsClient,
  defaultSolanaConfig
} from '@web3modal/adapters'

const queryClient = new QueryClient()

import '@web3modal/polyfills'

import { mainnet, sepolia } from 'wagmi/chains'

// Evm
const wagmiConfig = defaultWagmiConfig({
  chains: [mainnet, sepolia],
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata,
  ssr: true
})

const wagmiAdapter = new EVMWagmiClient({
  wagmiConfig
})

// Solana
const solanaConfig = defaultSolanaConfig({
  chains: [solana, solanaTestnet, solanaDevnet],
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata
})

const solanaWeb3JsAdapter = new SolanaWeb3JsClient({
  solanaConfig,
  chains: [solana, solanaTestnet, solanaDevnet]
})

const modal = createAppkit({
  projectId: ConstantsUtil.ProjectId,
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
  customWallets: ConstantsUtil.CustomWallets,
  enableOnramp: true,
  adapters: [wagmiAdapter, solanaWeb3JsAdapter]
})

ThemeStore.setModal(modal)

export default function Wagmi() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Web3ModalButtons />
        <WagmiModalInfo />
        <WagmiTests />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
