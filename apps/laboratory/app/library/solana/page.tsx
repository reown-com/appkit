'use client'

import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitConnections } from '@/src/components/AppKitConnections'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { SolanaTests } from '@/src/components/Solana/SolanaTests'
import { AppKitProvider } from '@/src/context/AppKitContext'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const networks = ConstantsUtil.SolanaNetworks

const solanaWeb3JsAdapter = new SolanaAdapter({
  registerWalletStandard: true
})

const config = {
  adapters: [solanaWeb3JsAdapter],
  networks,
  metadata: ConstantsUtil.Metadata,
  customWallets: ConstantsUtil.CustomWallets
}

export default function MultiChainSolanaAdapterOnly() {
  return (
    <AppKitProvider config={config}>
      <AppKitButtons />
      <AppKitConnections namespace="solana" />
      <AppKitInfo />
      <SolanaTests />
    </AppKitProvider>
  )
}
