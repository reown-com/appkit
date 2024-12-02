import { createAppKit } from '@reown/appkit-new/react'

import { ThemeStore } from '../../utils/StoreUtil'
import { AppKitButtons } from '../../components/AppKitButtons'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { SolanaTests } from '../../components/Solana/SolanaTests'
import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { solana } from '@reown/appkit-new/networks'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'

const networks = ConstantsUtil.SolanaNetworks

const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()]
})

const modal = createAppKit({
  adapters: [solanaWeb3JsAdapter],
  projectId: ConstantsUtil.ProjectId,
  networks,
  defaultNetwork: solana,
  features: {
    analytics: false,
    swaps: false,
    email: false,
    legalCheckbox: true,
    socials: []
  },
  termsConditionsUrl: 'https://reown.com/terms-of-service',
  privacyPolicyUrl: 'https://reown.com/privacy-policy'
})

ThemeStore.setModal(modal)

export default function Solana() {
  return (
    <>
      <AppKitButtons />
      <SolanaTests />
    </>
  )
}
