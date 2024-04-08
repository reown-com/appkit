import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { Web3ModalButtons } from '../../components/Web3ModalButtons'
import { WagmiTests } from '../../components/Wagmi/WagmiTests'
import { ThemeStore } from '../../utils/StoreUtil'
import { WagmiConstantsUtil } from '../../utils/WagmiConstants'
import { ConstantsUtil } from '../../utils/ConstantsUtil'

const queryClient = new QueryClient()

export const wagmiConfig = defaultWagmiConfig({
  chains: WagmiConstantsUtil.chains,
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata,
  ssr: true
})

const modal = createWeb3Modal({
  wagmiConfig,
  projectId: ConstantsUtil.ProjectId,
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
  customWallets: [
    {
      id: 'react-wallet-v2',
      name: 'react-wallet-v2',
      homepage: 'https://react-wallet-v2-git-chore-2111-walletconnect1.vercel.app',
      desktop_link: 'https://react-wallet.walletconnect.com',
      webapp_link: 'https://react-wallet.walletconnect.com'
    },
    {
      id: 'kotlin-web3wallet',
      name: 'kotlin-web3wallet',
      homepage: 'https://walletconnect.com',
      mobile_link: 'kotlin-web3wallet'
    },
    {
      id: 'swift-web3wallet',
      name: 'swift-web3wallet',
      homepage: 'https://walletconnect.com',
      mobile_link: 'walletapp'
    },
    {
      id: 'flutter-web3wallet',
      name: 'flutter-web3wallet',
      homepage: 'https://walletconnect.com',
      mobile_link: 'wcflutterwallet'
    }
  ],
  customWallets: ConstantsUtil.CustomWallets,
  enableOnramp: true
})

ThemeStore.setModal(modal)

export default function Wagmi() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Web3ModalButtons />
        <WagmiTests />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
