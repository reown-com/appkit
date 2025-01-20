import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'

import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'

import { AppKitButtons } from '../../components/AppKitButtons'
import { AppKitWalletButtons } from '../../components/AppKitWalletButtons'
import { SolanaTests } from '../../components/Solana/SolanaTests'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { ThemeStore } from '../../utils/StoreUtil'

const networks = ConstantsUtil.SolanaNetworks

const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()]
})

const modal = createAppKit({
  adapters: [solanaWeb3JsAdapter],
  projectId: ConstantsUtil.ProjectId,
  networks,
  defaultNetwork: solana
})

ThemeStore.setModal(modal)

export default function Solana() {
  return (
    <>
      <AppKitButtons />
      <AppKitWalletButtons
        wallets={[...ConstantsUtil.SolanaWalletButtons, ...ConstantsUtil.Socials]}
      />
      <SolanaTests />
    </>
  )
}
