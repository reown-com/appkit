'use client'

import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5'
import { mainnet } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { Ethers5Tests } from '@/src/components/Ethers/Ethers5Tests'
import InitializeBoundary from '@/src/components/InitializeBoundary'
import { SiweData } from '@/src/components/Siwe/SiweData'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'
import { siweConfig } from '@/src/utils/SiweUtils'
import { ThemeStore } from '@/src/utils/StoreUtil'

const networks = ConstantsUtil.EvmNetworks

const ethersAdapter = new Ethers5Adapter()

const modal = createAppKit({
  adapters: [ethersAdapter],
  networks,
  defaultNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId,
  features: {
    emailShowWallets: false,
    socials: []
  },
  siweConfig
})

ThemeStore.setModal(modal)

export default function Ethers() {
  return (
    <InitializeBoundary>
      <AppKitButtons />
      <AppKitInfo />
      <SiweData />
      <Ethers5Tests />
    </InitializeBoundary>
  )
}
