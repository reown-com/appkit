import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'

import { AppKitButtons } from '../../components/AppKitButtons'
import { AppKitWalletButtons } from '../../components/AppKitWalletButtons'
import { EthersModalInfo } from '../../components/Ethers/EthersModalInfo'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { ThemeStore } from '../../utils/StoreUtil'

const networks = ConstantsUtil.EvmNetworks

const ethersAdapter = new EthersAdapter()

const modal = createAppKit({
  adapters: [ethersAdapter],
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
      <EthersModalInfo />
    </>
  )
}
