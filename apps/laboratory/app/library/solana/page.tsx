'use client'

import {
  SolanaMobileWalletAdapter,
  createDefaultAddressSelector,
  createDefaultAuthorizationResultCache,
  createDefaultWalletNotFoundHandler
} from '@solana-mobile/wallet-adapter-mobile'
import { HuobiWalletAdapter } from '@solana/wallet-adapter-wallets'

import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { SolanaTests } from '@/src/components/Solana/SolanaTests'
import { AppKitProvider } from '@/src/context/AppKitContext'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const networks = ConstantsUtil.SolanaNetworks

const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [
    new HuobiWalletAdapter(),
    new SolanaMobileWalletAdapter({
      addressSelector: createDefaultAddressSelector(),
      appIdentity: {
        name: 'My app',
        uri: 'https://myapp.io',
        icon: 'relative/path/to/icon.png' // resolves to https://myapp.io/relative/path/to/icon.png
      },
      authorizationResultCache: createDefaultAuthorizationResultCache(),
      chain: 'devnet',
      onWalletNotFound: createDefaultWalletNotFoundHandler()
    })
  ]
})

const config = {
  adapters: [solanaWeb3JsAdapter],
  networks,

  metadata: ConstantsUtil.Metadata
}

export default function MultiChainSolanaAdapterOnly() {
  return (
    <AppKitProvider config={config}>
      <AppKitButtons />
      <AppKitInfo />
      <SolanaTests />
    </AppKitProvider>
  )
}
