import { createWeb3Modal } from '@rerock/base/react'
import { EVMEthersClient } from '@rerock/adapter-ethers'
import { EthersTests } from '../../components/Ethers/EthersTests'
import { AppKitButtons } from '../../components/AppKitButtons'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { EthersModalInfo } from '../../components/Ethers/EthersModalInfo'
import { arbitrum, mainnet, optimism, polygon, zkSync, sepolia } from '@rerock/base/chains'

const ethersAdapter = new EVMEthersClient()

const modal = createWeb3Modal({
  adapters: [ethersAdapter],
  caipNetworks: [mainnet, optimism, polygon, zkSync, arbitrum, sepolia],
  projectId: ConstantsUtil.ProjectId,
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
