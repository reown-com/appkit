import { EthersTests } from '../../components/Ethers/EthersTests'
import { AppKitButtons } from '../../components/AppKitButtons'
import { createAppKit } from '@reown/appkit/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { EthersModalInfo } from '../../components/Ethers/EthersModalInfo'
import { EVMEthersClient } from '@reown/appkit-adapter-ethers'
import { siweConfig } from '../../utils/SiweUtils'
import { arbitrum, mainnet, optimism, polygon, zkSync, sepolia } from '@reown/appkit/chains'

const ethersAdapter = new EVMEthersClient()

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
      <EthersModalInfo />
      <EthersTests />
    </>
  )
}
