import { createAppKit } from '@reown/appkit/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { AppKitButtons } from '../../components/AppKitButtons'
import { siweConfig } from '../../utils/SiweUtils'
import { SiweData } from '../../components/Siwe/SiweData'
import { Ethers5Tests } from '../../components/Ethers/Ethers5Tests'
import { Ethers5ModalInfo } from '../../components/Ethers/Ethers5ModalInfo'
import { EVMEthers5Client } from '@reown/appkit-adapter-ethers5'
import { arbitrum, mainnet, optimism, polygon, zkSync, sepolia } from '@reown/appkit/chains'

const ethersAdapter = new EVMEthers5Client()

const modal = createAppKit({
  adapters: [ethersAdapter],
  networks: [arbitrum, mainnet, optimism, polygon, zkSync, sepolia],
  defaultNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true,
    socials: []
  },
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
