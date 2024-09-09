import { createWeb3Modal } from '@rerock/base/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { AppKitButtons } from '../../components/AppKitButtons'
import { WagmiTests } from '../../components/Wagmi/WagmiTests'
import { ThemeStore } from '../../utils/StoreUtil'
import { WagmiModalInfo } from '../../components/Wagmi/WagmiModalInfo'
import { arbitrum, mainnet, optimism, polygon, zkSync } from '@rerock/base/chains'
import { EVMWagmiClient } from '@rerock/adapter-wagmi'

const metadata = {
  name: 'Evil Web3Modal',
  description: 'Evil Web3Modal Laboratory',
  url: 'https://malicious-app-verify-simulation.vercel.app/',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  verifyUrl: ''
}

// Special project ID with https://malicious-app-verify-simulation.vercel.app/ as the verified domain and this domain is marked as a scam
const projectId = '9d176efa3150a1df0a76c8c138b6b657'

const queryClient = new QueryClient()

const networks = [mainnet, optimism, polygon, zkSync, arbitrum]

const wagmiAdapter = new EVMWagmiClient({
  ssr: true,
  caipNetworks: networks,
  projectId
})

const modal = createWeb3Modal({
  adapters: [wagmiAdapter],
  caipNetworks: [mainnet],
  projectId,
  metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy'
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
