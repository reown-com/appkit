import { createAppkit } from '@web3modal/appkit'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { Web3ModalButtons } from '../../components/Web3ModalButtons'
import { siweConfig } from '../../utils/SiweUtils'

import {
  EVMWagmiClient,
  defaultWagmiConfig,
  SolanaWeb3JsClient,
  defaultSolanaConfig
} from '@web3modal/adapters'

import { mainnet, sepolia } from 'wagmi/chains'
import { solana, solanaDevnet, solanaTestnet } from '../../utils/ChainsUtil'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

const queryClient = new QueryClient()

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
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  projectId: ConstantsUtil.ProjectId,
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
  siweConfig,
  enableOnramp: true,
  customWallets: ConstantsUtil.CustomWallets,
  enableWalletFeatures: true
})

ThemeStore.setModal(modal)

export default function Appkit() {
  return (
    <>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <Web3ModalButtons />
        </QueryClientProvider>
      </WagmiProvider>
    </>
  )
}
