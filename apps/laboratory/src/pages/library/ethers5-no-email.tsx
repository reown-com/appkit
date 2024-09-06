import { createWeb3Modal } from '@web3modal/base/react'
import { EVMEthers5Client } from '@web3modal/adapter-ethers5'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { Ethers5ModalInfo } from '../../components/Ethers/Ethers5ModalInfo'
import { AppKitButtons } from '../../components/AppKitButtons'
import { Ethers5Tests } from '../../components/Ethers/Ethers5Tests'
import { arbitrum, mainnet, optimism, polygon, zkSync } from '@web3modal/base/chains'

const ethers5Adapter = new EVMEthers5Client()

const modal = createWeb3Modal({
  adapters: [ethers5Adapter],
  caipNetworks: [arbitrum, mainnet, optimism, polygon, zkSync],
  defaultCaipNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true,
    email: false,
    socials: []
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
