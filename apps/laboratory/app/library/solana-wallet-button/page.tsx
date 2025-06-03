'use client'

import { HuobiWalletAdapter } from '@solana/wallet-adapter-wallets'

import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana } from '@reown/appkit/networks'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitWalletButtons } from '@/src/components/AppKitWalletButtons'
import { SolanaTests } from '@/src/components/Solana/SolanaTests'
import { AppKitProvider } from '@/src/context/AppKitContext'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const networks = ConstantsUtil.SolanaNetworks

const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new HuobiWalletAdapter()]
})

const config = {
  adapters: [solanaWeb3JsAdapter],
  networks,
  defaultNetwork: solana
}

export default function SolanaWalletButton() {
  return (
    <AppKitProvider config={config}>
      <AppKitButtons />
      <AppKitWalletButtons
        wallets={[
          ...ConstantsUtil.SolanaWalletButtons,
          ...ConstantsUtil.Socials,
          ConstantsUtil.Email
        ]}
      />
      <SolanaTests />
    </AppKitProvider>
  )
}
