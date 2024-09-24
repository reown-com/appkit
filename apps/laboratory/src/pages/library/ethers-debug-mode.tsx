import { EthersTests } from '../../components/Ethers/EthersTests'
import { AppKitButtons } from '../../components/AppKitButtons'
import { createAppKit } from '@reown/appkit/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { EthersModalInfo } from '../../components/Ethers/EthersModalInfo'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { siweConfig } from '../../utils/SiweUtils'
import { arbitrum, mainnet, optimism, polygon, zkSync, sepolia } from '@reown/appkit/networks'

const ethersAdapter = new EthersAdapter()

const modal = createAppKit({
  adapters: [ethersAdapter],
  networks: [arbitrum, mainnet, optimism, polygon, zkSync, sepolia],
  defaultNetwork: mainnet,
  projectId: '',
  features: {
    analytics: true,
    socials: []
  },
  siweConfig,
  debug: true
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
