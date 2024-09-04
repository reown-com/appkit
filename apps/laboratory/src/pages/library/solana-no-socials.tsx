import { createWeb3Modal } from '@web3modal/base/react'
import { SolanaWeb3JsClient } from '@web3modal/adapter-solana/react'

import { ThemeStore } from '../../utils/StoreUtil'
import { solana, solanaDevnet, solanaTestnet } from '@web3modal/base/chains'
import { AppKitButtons } from '../../components/AppKitButtons'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { SolanaTests } from '../../components/Solana/SolanaTests'
import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'

const chains = [solana, solanaTestnet, solanaDevnet]

const solanaWeb3JsAdapter = new SolanaWeb3JsClient({
  wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()]
})

const modal = createWeb3Modal({
  adapters: [solanaWeb3JsAdapter],
  caipNetworks: chains,
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata,
  features: {
    email: true,
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