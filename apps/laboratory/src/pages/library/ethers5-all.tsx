import { createWeb3Modal } from '@rerock/appkit/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { AppKitButtons } from '../../components/AppKitButtons'
import { siweConfig } from '../../utils/SiweUtils'
import { SiweData } from '../../components/Siwe/SiweData'
import { Ethers5Tests } from '../../components/Ethers/Ethers5Tests'
import { Ethers5ModalInfo } from '../../components/Ethers/Ethers5ModalInfo'
import { arbitrum, mainnet, optimism, polygon, zkSync, sepolia } from '@rerock/appkit/chains'
import { EVMEthers5Client } from '@rerock/appkit-adapter-ethers5'

const ethers5Adapter = new EVMEthers5Client()

const modal = createWeb3Modal({
  adapters: [ethers5Adapter],
  caipNetworks: [arbitrum, mainnet, optimism, polygon, zkSync, sepolia],
  defaultCaipNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true,
    socials: ['google', 'x', 'discord', 'farcaster', 'github', 'apple', 'facebook']
  },
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
  siweConfig
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
