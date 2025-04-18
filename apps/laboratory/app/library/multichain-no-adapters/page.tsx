'use client'

import { type AppKitNetwork, bitcoin, mainnet, solana } from '@reown/appkit/networks'
import { useAppKitNetwork } from '@reown/appkit/react'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { MultiChainInfo } from '@/src/components/MultiChainInfo'
import { UpaTests } from '@/src/components/UPA/UpaTests'
import { AppKitProvider } from '@/src/context/AppKitContext'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const networks = ConstantsUtil.AllNetworks

const config = {
  networks: networks as [AppKitNetwork, ...AppKitNetwork[]],
  defaultNetwork: mainnet,
  metadata: ConstantsUtil.Metadata
}

export default function MultiChainWagmiAdapterOnly() {
  const { switchNetwork } = useAppKitNetwork()

  return (
    <AppKitProvider config={config}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={() => switchNetwork(solana)}>Switch to Solana</button>
        <button onClick={() => switchNetwork(bitcoin)}>Switch to Bitcoin</button>
      </div>
      <AppKitButtons />
      <AppKitInfo />
      <MultiChainInfo />
      <UpaTests />
    </AppKitProvider>
  )
}
