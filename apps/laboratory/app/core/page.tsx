'use client'

import { createAppKit } from '@reown/appkit/basic-react'
import { type AppKitNetwork, mainnet } from '@reown/appkit/networks'

import { AppKitHooks } from '@/src/components/AppKitHooks'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { MultiChainInfo } from '@/src/components/MultiChainInfo'
import { UpaTests } from '@/src/components/UPA/UpaTests'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'
import { ThemeStore } from '@/src/utils/StoreUtil'

const networks = ConstantsUtil.AllNetworks

const modal = createAppKit({
  networks: networks as [AppKitNetwork, ...AppKitNetwork[]],
  defaultNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata
})

ThemeStore.setModal(modal)

export default function MultiChainWagmiAdapterOnly() {
  return (
    <>
      <AppKitHooks />
      <AppKitInfo />
      <MultiChainInfo />
      <UpaTests />
    </>
  )
}
