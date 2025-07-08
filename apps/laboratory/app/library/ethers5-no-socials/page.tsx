'use client'

import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5'
import { mainnet } from '@reown/appkit/networks'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { Ethers5Tests } from '@/src/components/Ethers/Ethers5Tests'
import InitializeBoundary from '@/src/components/InitializeBoundary'
import { SiweData } from '@/src/components/Siwe/SiweData'
import { AppKitProvider } from '@/src/context/AppKitContext'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'
import { siweConfig } from '@/src/utils/SiweUtils'

const networks = ConstantsUtil.EvmNetworks

const ethersAdapter = new Ethers5Adapter()

const config = {
  adapters: [ethersAdapter],
  networks,
  defaultNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId,
  features: {
    emailShowWallets: false,
    socials: []
  },
  siweConfig
}

export default function Ethers() {
  return (
    <AppKitProvider config={config}>
      <InitializeBoundary>
        <AppKitButtons />
        <AppKitInfo />
        <SiweData />
        <Ethers5Tests />
      </InitializeBoundary>
    </AppKitProvider>
  )
}
