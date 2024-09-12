import { createWeb3Modal } from '@reown/appkit/react'
import { AppKitButtons } from '../../components/AppKitButtons'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { Ethers5ModalInfo } from '../../components/Ethers/Ethers5ModalInfo'
import { Ethers5Tests } from '../../components/Ethers/Ethers5Tests'
import { EVMEthers5Client } from '@reown/appkit-adapter-ethers5'
import { arbitrum, mainnet, optimism, polygon, zkSync, sepolia } from '@reown/appkit/chains'

const ethers5Adapter = new EVMEthers5Client()

const modal = createWeb3Modal({
  adapters: [ethers5Adapter],
  caipNetworks: [mainnet, optimism, polygon, zkSync, arbitrum, sepolia],
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'github', 'apple', 'discord']
  },
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
  customWallets: ConstantsUtil.CustomWallets
})

ThemeStore.setModal(modal)

export default function Ethers() {
  return (
    <>
      <AppKitButtons />
      <Ethers5ModalInfo />
      <Ethers5Tests />
    </>
  )
}
