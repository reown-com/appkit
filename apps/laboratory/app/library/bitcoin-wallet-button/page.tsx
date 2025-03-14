'use client'

import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { type CaipNetwork, createAppKit } from '@reown/appkit/react'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitWalletButtons } from '@/src/components/AppKitWalletButtons'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'
import { ThemeStore } from '@/src/utils/StoreUtil'

const networks = ConstantsUtil.BitcoinNetworks

const bitcoinAdapter = new BitcoinAdapter({
  networks: networks as CaipNetwork[],
  projectId: ConstantsUtil.ProjectId
})

const modal = createAppKit({
  adapters: [bitcoinAdapter],
  networks,
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true,
    email: false,
    socials: []
  },
  metadata: ConstantsUtil.Metadata
})

ThemeStore.setModal(modal)

export default function Wagmi() {
  return (
    <>
      <AppKitButtons />
      <AppKitWalletButtons wallets={ConstantsUtil.BitcoinWalletButtons} />
    </>
  )
}
