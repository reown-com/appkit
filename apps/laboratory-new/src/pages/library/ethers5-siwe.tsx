import { createAppKit } from '@reown/appkit-new/react'
import { SiweData } from '../../components/Siwe/SiweData'
import { AppKitButtons } from '../../components/AppKitButtons'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { siweConfig } from '../../utils/SiweUtils'
import { Ethers5Tests } from '../../components/Ethers/Ethers5Tests'
import { Ethers5ModalInfo } from '../../components/Ethers/Ethers5ModalInfo'
import { mainnet } from '@reown/appkit-new/networks'
import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5'

const networks = ConstantsUtil.EvmNetworks

const ethers5Adapter = new Ethers5Adapter()

const modal = createAppKit({
  adapters: [ethers5Adapter],
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
      <Ethers5ModalInfo />
      <SiweData />
      <Ethers5Tests />
    </>
  )
}
