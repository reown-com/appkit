import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { Ethers5ModalInfo } from '../../components/Ethers/Ethers5ModalInfo'
import { AppKitButtons } from '../../components/AppKitButtons'
import { mainnet } from '@reown/appkit/networks'
import { AppKitWalletButtons } from '../../components/AppKitWalletButtons'

const networks = ConstantsUtil.EvmNetworks

const ethers5Adapter = new EthersAdapter()

const modal = createAppKit({
  adapters: [ethers5Adapter],
  networks,
  defaultNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId
})

ThemeStore.setModal(modal)

export default function Ethers() {
  return (
    <>
      <AppKitButtons />
      <AppKitWalletButtons
        wallets={[...ConstantsUtil.EvmWalletButtons, ...ConstantsUtil.Socials]}
      />
      <Ethers5ModalInfo />
    </>
  )
}
