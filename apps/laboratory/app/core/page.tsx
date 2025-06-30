'use client'

import { type AppKitNetwork, mainnet } from '@reown/appkit/networks'

import { AppKitCoreHooks } from '@/src/components/AppKitCoreHooks'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { MultiChainInfo } from '@/src/components/MultiChainInfo'
import { UpaTests } from '@/src/components/UPA/UpaTests'
import { AppKitProvider } from '@/src/context/AppKitContext'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const networks = ConstantsUtil.AllNetworks

const config = {
  networks: networks as [AppKitNetwork, ...AppKitNetwork[]],
  defaultNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata
}

export default function MultiChainWagmiAdapterOnly() {
  return (
    <>
      <AppKitProvider config={config}>
        <AppKitCoreHooks />
        <AppKitInfo />
        <MultiChainInfo />
        <UpaTests />
      </AppKitProvider>
    </>
  )
}
