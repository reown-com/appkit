import { createWeb3Modal, defaultSolanaConfig } from '@web3modal/solana/react'

import { ThemeStore } from '../../utils/StoreUtil'

import { AppKitButtons } from '../../components/AppKitButtons'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { SolanaTests } from '../../components/Solana/SolanaTests'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { solana, solanaDevnet, solanaTestnet } from '../../utils/NetworksUtil'

const chains = [solana, solanaTestnet, solanaDevnet]

export const solanaConfig = defaultSolanaConfig({
  chains,
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata,
  auth: {
    email: true,
    socials: ['google', 'x', 'discord', 'farcaster', 'github', 'apple', 'facebook'],
    walletFeatures: true,
    showWallets: true
  }
})

const modal = createWeb3Modal({
  solanaConfig,
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata,
  caipNetworks: [solana, solanaTestnet, solanaDevnet],
  features: {
    swaps: false,
    analytics: true
  },
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
  customWallets: ConstantsUtil.CustomWallets,
  wallets: [new SolflareWalletAdapter()]
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
