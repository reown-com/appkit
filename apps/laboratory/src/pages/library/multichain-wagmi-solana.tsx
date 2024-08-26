import React from 'react'
import { createWeb3Modal } from '@web3modal/base/react'
import { EVMWagmiClient } from '@web3modal/base/adapters/evm/wagmi'
import { SolanaWeb3JsClient } from '@web3modal/base/adapters/solana/web3js'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { arbitrum, mainnet, solana } from '../../utils/NetworksUtil'
import { AppKitButtons } from '../../components/AppKitButtons'
import { WagmiModalInfo } from '../../components/Wagmi/WagmiModalInfo'
import { MultiChainInfo } from '../../components/MultiChainInfo'
import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { MultiChainTests } from '../../components/MultiChainTests'
import { WagmiTests } from '../../components/Wagmi/WagmiTests'

const queryClient = new QueryClient()

const wagmiAdapter = new EVMWagmiClient()

const solanaWeb3JsAdapter = new SolanaWeb3JsClient({
  solanaConfig: {
    metadata: ConstantsUtil.Metadata
  },
  wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()]
})

const modal = createWeb3Modal({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  // @ts-expect-error Wagmi's chains are different from our CaipNetwork type
  caipNetworks: [mainnet, arbitrum, solana],
  projectId: ConstantsUtil.ProjectId,
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
  customWallets: ConstantsUtil.CustomWallets
})

ThemeStore.setModal(modal)

export default function MultiChainAllAdapters() {
  const [rendered, setRendered] = React.useState(false)

  React.useEffect(() => {
    setRendered(true)
  }, [])

  if (!rendered) {
    return null
  }

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitButtons />
        <MultiChainInfo />
        <WagmiModalInfo />
        <WagmiTests />
        <MultiChainTests />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
