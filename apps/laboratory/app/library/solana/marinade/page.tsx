'use client'

import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'

import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { createAppKit } from '@reown/appkit/react'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { SolanaTests } from '@/src/components/Solana/SolanaTests'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'
import { ThemeStore } from '@/src/utils/StoreUtil'

const networks = ConstantsUtil.SolanaNetworks

const solanaWeb3JsAdapter = new SolanaAdapter({
  connectionSettings: {
    wsEndpoint:
      'wss://few-long-bird.solana-mainnet.quiknode.pro/7fe85ead0708626d3a657779fd3391709008e94b/',
    commitment: 'confirmed'
  },
  wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()]
})

const modal = createAppKit({
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata,
  adapters: [solanaWeb3JsAdapter],
  networks,
  features: {
    analytics: true,
    email: false,
    socials: false
  }
})

ThemeStore.setModal(modal)

export default function MultiChainSolanaAdapterOnly() {
  return (
    <>
      <AppKitButtons />
      <AppKitInfo />
      <SolanaTests />
    </>
  )
}
