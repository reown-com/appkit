'use client'

import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { type CaipNetwork } from '@reown/appkit/react'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitWalletButtons } from '@/src/components/AppKitWalletButtons'
import { AppKitProvider } from '@/src/context/AppKitContext'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const networks = ConstantsUtil.BitcoinNetworks

const bitcoinAdapter = new BitcoinAdapter({
  networks: networks as CaipNetwork[],
  projectId: ConstantsUtil.ProjectId
})

const config = {
  adapters: [bitcoinAdapter],
  networks,
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true,
    email: false,
    socials: []
  },
  metadata: ConstantsUtil.Metadata
}

export default function Wagmi() {
  return (
    <AppKitProvider config={config}>
      <AppKitButtons />
      <AppKitWalletButtons wallets={ConstantsUtil.BitcoinWalletButtons} showActions={false} />
    </AppKitProvider>
  )
}
