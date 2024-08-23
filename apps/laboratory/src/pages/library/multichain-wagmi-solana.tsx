import { createWeb3Modal } from '@web3modal/base/react'
import { EVMWagmiClient } from '@web3modal/base/adapters/evm/wagmi'
import { SolanaWeb3JsClient } from '@web3modal/base/adapters/solana/web3js'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getWagmiConfig, WagmiConstantsUtil } from '../../utils/WagmiConstants'
import { WagmiProvider } from 'wagmi'
import { solana } from '../../utils/NetworksUtil'
import { AppKitButtons } from '../../components/AppKitButtons'
import { WagmiModalInfo } from '../../components/Wagmi/WagmiModalInfo'
import { MultiChainInfo } from '../../components/MultiChainInfo'
import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { MultiChainTests } from '../../components/MultiChainTests'

const queryClient = new QueryClient()

const wagmiConfig = getWagmiConfig('default')

const wagmiAdapter = new EVMWagmiClient({})

const solanaWeb3JsAdapter = new SolanaWeb3JsClient({
  solanaConfig: {
    metadata: ConstantsUtil.Metadata
  },
  wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()]
})

const modal = createWeb3Modal({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  // @ts-expect-error Wagmi's chains are different from our CaipNetwork type
  caipNetworks: [...WagmiConstantsUtil.chains, solana, solanaTestnet, solanaDevnet],
  projectId: ConstantsUtil.ProjectId,
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
  customWallets: ConstantsUtil.CustomWallets
})

ThemeStore.setModal(modal)

export default function MultiChainAllAdapters() {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitButtons />
        <MultiChainInfo />
        <WagmiModalInfo />
        <MultiChainTests />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
