import { createWeb3Modal } from '@web3modal/base/react'
import { EVMEthersClient } from '@web3modal/adapter-ethers'
import { SiweData } from '../../components/Siwe/SiweData'
import { EthersTests } from '../../components/Ethers/EthersTests'
import { AppKitButtons } from '../../components/AppKitButtons'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { siweConfig } from '../../utils/SiweUtils'
import { EthersModalInfo } from '../../components/Ethers/EthersModalInfo'
import { arbitrum, mainnet, optimism, polygon, zkSync } from '@web3modal/base/chains'

const ethersAdapter = new EVMEthersClient()

const modal = createWeb3Modal({
  adapters: [ethersAdapter],
  caipNetworks: [mainnet, optimism, polygon, zkSync, arbitrum],
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true
  },
  siweConfig,
  customWallets: ConstantsUtil.CustomWallets
})

ThemeStore.setModal(modal)

export default function EthersSiwe() {
  return (
    <>
      <AppKitButtons />
      <EthersModalInfo />
      <SiweData />
      <EthersTests />
    </>
  )
}
