'use client'

import { type AppKitNetwork, bitcoin, mainnet, solana } from '@reown/appkit/networks'
import { createAppKit, useAppKitNetwork } from '@reown/appkit/react'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import InitializeBoundary from '@/src/components/InitializeBoundary'
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
  const { switchNetwork } = useAppKitNetwork()

  return (
    <InitializeBoundary>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={() => switchNetwork(solana)}>Switch to Solana</button>
        <button onClick={() => switchNetwork(bitcoin)}>Switch to Bitcoin</button>
      </div>
      <AppKitButtons />
      <AppKitInfo />
      <MultiChainInfo />
      <UpaTests />
    </InitializeBoundary>
  )
}
