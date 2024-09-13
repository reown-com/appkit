import { createWeb3Modal } from '@reown/appkit/react'
import { EVMEthersClient } from '@reown/appkit-adapter-ethers'
import { SolanaWeb3JsClient } from '@reown/appkit-adapter-solana'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import {
  mainnet,
  polygon,
  solana,
  arbitrum,
  optimism,
  solanaTestnet,
  solanaDevnet
} from '@reown/appkit/chains'
import { AppKitButtons } from '../../components/AppKitButtons'
import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { MultiChainTestsEthersSolana } from '../../components/MultiChainTestsEthersSolana'

const etherAdapter = new EVMEthersClient()

const solanaWeb3JsAdapter = new SolanaWeb3JsClient({
  wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()]
})

const modal = createWeb3Modal({
  adapters: [etherAdapter, solanaWeb3JsAdapter],
  projectId: ConstantsUtil.ProjectId,
  caipNetworks: [mainnet, arbitrum, polygon, optimism, solana, solanaTestnet, solanaDevnet],
  features: {
    analytics: true
  },
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy'
})

ThemeStore.setModal(modal)

export default function MultiChainEthers5Solana() {
  return (
    <>
      <AppKitButtons />
      <MultiChainTestsEthersSolana />
    </>
  )
}
