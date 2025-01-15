import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { type CaipNetwork, createAppKit } from '@reown/appkit/react'

import { AppKitButtons } from '../../components/AppKitButtons'
import { BitcoinTests } from '../../components/Bitcoin/BitcoinTests'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { ThemeStore } from '../../utils/StoreUtil'

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
