import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet } from '@reown/appkit-new/networks'
import { createAppKit } from '@reown/appkit-new/react'

import { AppKitButtons } from '../../components/AppKitButtons'
import { EthersModalInfo } from '../../components/Ethers/EthersModalInfo'
import { EthersTests } from '../../components/Ethers/EthersTests'
import { SiweData } from '../../components/Siwe/SiweData'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { siweConfig } from '../../utils/SiweUtils'
import { ThemeStore } from '../../utils/StoreUtil'

const networks = ConstantsUtil.EvmNetworks

const ethersAdapter = new EthersAdapter()

const modal = createAppKit({
  adapters: [ethersAdapter],
  networks,
  defaultNetwork: mainnet,
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
