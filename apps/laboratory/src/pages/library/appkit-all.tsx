import { createAppKit } from '@web3modal/appkit/react'
import { EVMWagmiClient } from '@web3modal/appkit/adapters/evm/wagmi'
import { SolanaWeb3JsClient, defaultSolanaConfig } from '@web3modal/appkit/adapters/solana/web3js'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { AppKitButtons } from '../../components/AppKitButtons'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getWagmiConfig } from '../../utils/WagmiConstants'
import { WagmiProvider } from 'wagmi'
import { solana, solanaDevnet, solanaTestnet } from '../../utils/ChainsUtil'
import { AppKitInfo } from '../../components/AppKitInfo'

const queryClient = new QueryClient()

const wagmiConfig = getWagmiConfig('default')

const wagmiAdapter = new EVMWagmiClient({
  wagmiConfig
})

const solanaConfig = defaultSolanaConfig({
  chains: [solana, solanaTestnet, solanaDevnet],
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata
})

const solanaWeb3JsAdapter = new SolanaWeb3JsClient({
  solanaConfig,
  chains: [solana, solanaTestnet, solanaDevnet]
})

const modal = createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  projectId: ConstantsUtil.ProjectId,
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
  customWallets: ConstantsUtil.CustomWallets,
  sdkType: 'w3m',
  sdkVersion: 'html-wagmi-1.0.0'
})

ThemeStore.setModal(modal)

export default function AppKitMultipleAdapters() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitButtons />
        <AppKitInfo />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
