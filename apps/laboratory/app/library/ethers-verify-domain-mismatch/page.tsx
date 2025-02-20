'use client'

import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { EthersModalInfo } from '@/src/components/Ethers/EthersModalInfo'
import { EthersTests } from '@/src/components/Ethers/EthersTests'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'
import { ThemeStore } from '@/src/utils/StoreUtil'

// Special project ID with verify enabled on localhost
const projectId = 'e4eae1aad4503db9966a04fd045a7e4d'

const modal = createAppKit({
  adapters: [new EthersAdapter()],
  networks: ConstantsUtil.EvmNetworks,
  defaultNetwork: mainnet,
  projectId,
  metadata: {
    name: 'AppKit',
    description: 'AppKit Laboratory',
    url: 'https://example.com',
    icons: []
  },
  features: {
    analytics: true
  },
  customWallets: ConstantsUtil.CustomWallets
})

ThemeStore.setModal(modal)

export default function Ethers() {
  return (
    <>
      <AppKitButtons />
      <EthersModalInfo />
      <EthersTests />
    </>
  )
}
