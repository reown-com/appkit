import { createAppKit, type CaipNetwork } from '@reown/appkit/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'

import { AppKitButtons } from '../../components/AppKitButtons'

import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'

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
    analytics: true
  },
  metadata: ConstantsUtil.Metadata,
  debug: true
})

ThemeStore.setModal(modal)

export default function MultiChainBitcoinAdapterOnly() {
  return (
    <>
      <AppKitButtons />
    </>
  )
}
