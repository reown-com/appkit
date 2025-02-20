'use client'

import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5'
import { mainnet } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { Ethers5ModalInfo } from '@/src/components/Ethers/Ethers5ModalInfo'
import { Ethers5Tests } from '@/src/components/Ethers/Ethers5Tests'
import { SiweData } from '@/src/components/Siwe/SiweData'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'
import { siweConfig } from '@/src/utils/SiweUtils'
import { ThemeStore } from '@/src/utils/StoreUtil'

const networks = ConstantsUtil.EvmNetworks
const ethers5Adapter = new Ethers5Adapter()

const modal = createAppKit({
  adapters: [ethers5Adapter],
  networks,
  defaultNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true,
    socials: ['google', 'x', 'discord', 'farcaster', 'github', 'apple', 'facebook']
  },
  termsConditionsUrl: 'https://reown.com/terms-of-service',
  privacyPolicyUrl: 'https://reown.com/privacy-policy',
  siweConfig,
  customWallets: ConstantsUtil.CustomWallets
})

ThemeStore.setModal(modal)

export default function Ethers() {
  return (
    <>
      <AppKitButtons />
      <Ethers5ModalInfo />
      <SiweData />
      <Ethers5Tests />
    </>
  )
}
