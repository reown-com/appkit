import { createAppKit, type CaipNetwork } from '@reown/appkit/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'

import { AppKitButtons } from '../../components/AppKitButtons'

import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'

import { BitcoinTests } from '../../components/Bitcoin/BitcoinTests'

const networks = ConstantsUtil.BitcoinNetworks

const bitcoinAdapter = new BitcoinAdapter({
  networks: networks as CaipNetwork[],
  projectId: ConstantsUtil.ProjectId
})

const appkit = createAppKit({
  adapters: [bitcoinAdapter],
  networks,
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true,
    email: false,
    socials: []
  },
  metadata: ConstantsUtil.Metadata,
  debug: true
})

ThemeStore.setModal(appkit)

export default function MultiChainBitcoinAdapterOnly() {
  return (
    <>
      <AppKitButtons />
      <BitcoinTests />
    </>
  )
}
