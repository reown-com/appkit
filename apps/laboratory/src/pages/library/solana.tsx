import { createWeb3Modal } from '@web3modal/base/react'

import { ThemeStore } from '../../utils/StoreUtil'
import { solana, solanaDevnet, solanaTestnet } from '../../utils/NetworksUtil'
import { AppKitButtons } from '../../components/AppKitButtons'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { SolanaTests } from '../../components/Solana/SolanaTests'
import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { SolanaWeb3JsClient, defaultSolanaConfig } from '@web3modal/base/adapters/solana/web3js'

const chains = [solana, solanaTestnet, solanaDevnet]

export const solanaConfig = defaultSolanaConfig({
  chains,
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata
})

const solanaWeb3JsAdapter = new SolanaWeb3JsClient({
  solanaConfig: {
    metadata: ConstantsUtil.Metadata
  },
  wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()]
})

const modal = createWeb3Modal({
  adapters: [solanaWeb3JsAdapter],
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata,
  defaultCaipNetwork: solana,
  caipNetworks: [solana, solanaTestnet, solanaDevnet],
  features: {
    analytics: true,
    email: true,
    socials: ['apple', 'discord', 'farcaster'],
    emailShowWallets: false
  },
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
  customWallets: ConstantsUtil.CustomWallets
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
