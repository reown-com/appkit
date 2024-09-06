import { EthersTests } from '../../components/Ethers/EthersTests'
import { AppKitButtons } from '../../components/AppKitButtons'
import { createWeb3Modal } from '@web3modal/base/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { EthersModalInfo } from '../../components/Ethers/EthersModalInfo'
import { EVMEthersClient } from '@web3modal/adapter-ethers'
import { siweConfig } from '../../utils/SiweUtils'
import { arbitrum, mainnet, optimism, polygon, zkSync } from '@web3modal/base/chains'

const ethersAdapter = new EVMEthersClient()

const modal = createWeb3Modal({
  adapters: [ethersAdapter],
  caipNetworks: [arbitrum, mainnet, optimism, polygon, zkSync],
  defaultCaipNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true,
    email: false,
    socials: []
  },
  siweConfig
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
