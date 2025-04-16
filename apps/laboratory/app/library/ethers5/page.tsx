'use client'

import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5'
import { mainnet } from '@reown/appkit/networks'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { Ethers5Tests } from '@/src/components/Ethers/Ethers5Tests'
import { AppKitProvider } from '@/src/context/AppKitContext'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const networks = ConstantsUtil.EvmNetworks

const ethers5Adapter = new Ethers5Adapter()

const config = {
  adapters: [ethers5Adapter],
  networks,
  defaultNetwork: mainnet,
  features: {
    analytics: true
  },
  customWallets: ConstantsUtil.CustomWallets
}

export default function Ethers5() {
  return (
    <AppKitProvider config={config}>
      <AppKitButtons />
      <AppKitInfo />
      <Ethers5Tests />
    </AppKitProvider>
  )
}
