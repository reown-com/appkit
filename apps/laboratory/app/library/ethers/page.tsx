'use client'

import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet } from '@reown/appkit/networks'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitConnections } from '@/src/components/AppKitConnections'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { EthersTests } from '@/src/components/Ethers/EthersTests'
import { AppKitProvider } from '@/src/context/AppKitContext'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const networks = ConstantsUtil.EvmNetworks

const ethersAdapter = new EthersAdapter()

const config = {
  adapters: [ethersAdapter],
  networks,
  defaultNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId,
  customWallets: ConstantsUtil.CustomWallets
}

export default function Ethers() {
  return (
    <AppKitProvider config={config}>
      <AppKitButtons />
      <AppKitConnections namespace="eip155" />
      <AppKitInfo />
      <EthersTests />
    </AppKitProvider>
  )
}
