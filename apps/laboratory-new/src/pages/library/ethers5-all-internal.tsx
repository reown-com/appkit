import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5'
import { mainnet } from '@reown/appkit-new/networks'
import { createAppKit } from '@reown/appkit-new/react'

import { AppKitButtons } from '../../components/AppKitButtons'
import { Ethers5ModalInfo } from '../../components/Ethers/Ethers5ModalInfo'
import { Ethers5Tests } from '../../components/Ethers/Ethers5Tests'
import { SiweData } from '../../components/Siwe/SiweData'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { siweConfig } from '../../utils/SiweUtils'
import { ThemeStore } from '../../utils/StoreUtil'

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
