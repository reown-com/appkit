import { EthersTests } from '../../components/Ethers/EthersTests'
import { AppKitButtons } from '../../components/AppKitButtons'
import { createAppKit } from '@reown/appkit-new/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { EthersModalInfo } from '../../components/Ethers/EthersModalInfo'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { siweConfig } from '../../utils/SiweUtils'
import { mainnet } from '@reown/appkit-new/networks'

const networks = ConstantsUtil.EvmNetworks

const ethersAdapter = new EthersAdapter()

const modal = createAppKit({
  adapters: [ethersAdapter],
  networks,
  defaultNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true,
    socials: [],
    emailShowWallets: false
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
