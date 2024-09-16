import { createAppKit } from '@reown/appkit/react'
import { EVMEthersClient } from '@reown/appkit-adapter-ethers'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { EthersModalInfo } from '../../components/Ethers/EthersModalInfo'
import { AppKitButtons } from '../../components/AppKitButtons'
import { EthersTests } from '../../components/Ethers/EthersTests'
import { arbitrum, mainnet, optimism, polygon, zkSync, sepolia } from '@reown/appkit/networks'

const ethersAdapter = new EVMEthersClient()

const modal = createAppKit({
  adapters: [ethersAdapter],
  networks: [arbitrum, mainnet, optimism, polygon, zkSync, sepolia],
  defaultNetwork: mainnet,
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
      <EthersModalInfo />
      <EthersTests />
    </>
  )
}
