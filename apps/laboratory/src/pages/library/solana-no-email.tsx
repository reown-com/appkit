import { createWeb3Modal } from '@reown/appkit/react'

import { ThemeStore } from '../../utils/StoreUtil'
import { AppKitButtons } from '../../components/AppKitButtons'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { SolanaTests } from '../../components/Solana/SolanaTests'
import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { solana, solanaDevnet, solanaTestnet } from '@reown/appkit/chains'
import { SolanaWeb3JsClient } from '@reown/appkit-adapter-solana/react'

const solanaWeb3JsAdapter = new SolanaWeb3JsClient({
  wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()]
})

const modal = createWeb3Modal({
  adapters: [solanaWeb3JsAdapter],
  projectId: ConstantsUtil.ProjectId,
  caipNetworks: [solana, solanaTestnet, solanaDevnet],
  defaultCaipNetwork: solana,
  features: {
    analytics: false,
    swaps: false,
    email: false,
    socials: []
  }
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
