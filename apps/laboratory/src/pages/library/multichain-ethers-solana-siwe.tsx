import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { AppKitButtons } from '../../components/AppKitButtons'
import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { MultiChainTestsEthersSolana } from '../../components/MultiChainTestsEthersSolana'
import { siweConfig } from '../../utils/SiweUtils'
import { SiweData } from '../../components/Siwe/SiweData'
import { mainnet } from '@reown/appkit/networks'

const networks = ConstantsUtil.AllNetworks

const etherAdapter = new EthersAdapter()

const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()]
})

const modal = createAppKit({
  adapters: [etherAdapter, solanaWeb3JsAdapter],
  projectId: ConstantsUtil.ProjectId,
  networks,
  defaultNetwork: mainnet,
  features: {
    analytics: true
  },
  termsConditionsUrl: 'https://reown.com/terms-of-service',
  privacyPolicyUrl: 'https://reown.com/privacy-policy',
  siweConfig
})

ThemeStore.setModal(modal)

export default function MultiChainEthersSolana() {
  return (
    <>
      <AppKitButtons />
      <SiweData />
      <MultiChainTestsEthersSolana />
    </>
  )
}
