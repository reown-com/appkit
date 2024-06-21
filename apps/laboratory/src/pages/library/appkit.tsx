import { createAppKit } from '@web3modal/appkit/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { siweConfig } from '../../utils/SiweUtils'

import {
  EVMWagmiClient
  // defaultWagmiConfig,
  // SolanaWeb3JsClient,
  // defaultSolanaConfig
} from '@web3modal/adapters'

// import { mainnet, sepolia } from 'wagmi/chains'
// import { solana, solanaDevnet, solanaTestnet } from '../../utils/ChainsUtil'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { AppKitButtons } from '../../components/AppKitButtons'
import { AppKitInfo } from '../../components/AppKitStatus'
import { getWagmiConfig } from '../../utils/WagmiConstants'

const queryClient = new QueryClient()

// Evm
const wagmiConfig = getWagmiConfig('default')

const wagmiAdapter = new EVMWagmiClient({
  // @ts-expect-error - will be fixing
  wagmiConfig
})

// Solana
// const solanaConfig = defaultSolanaConfig({
//   chains: [solana, solanaTestnet, solanaDevnet],
//   projectId: ConstantsUtil.ProjectId,
//   metadata: ConstantsUtil.Metadata
// })

// const solanaWeb3JsAdapter = new SolanaWeb3JsClient({
//   solanaConfig,
//   chains: [solana, solanaTestnet, solanaDevnet]
// })

const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId: ConstantsUtil.ProjectId,
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
  enableOnramp: true,
  siweConfig,
  // customWallets: ConstantsUtil.CustomWallets,
  enableWalletFeatures: true
})

ThemeStore.setModal(modal)

export default function AppKit() {
  return (
    <>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <AppKitButtons />
          <AppKitInfo />
        </QueryClientProvider>
      </WagmiProvider>
    </>
  )
}
