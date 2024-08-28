import { createWeb3Modal } from '@web3modal/base/react'
import { SiweData } from '../../components/Siwe/SiweData'
import { AppKitButtons } from '../../components/AppKitButtons'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { siweConfig } from '../../utils/SiweUtils'
import { Ethers5Tests } from '../../components/Ethers/Ethers5Tests'
import { Ethers5ModalInfo } from '../../components/Ethers/Ethers5ModalInfo'
import { mainnet, optimism, polygon, zkSync } from '../../utils/NetworksUtil'
import { defaultConfig, EVMEthers5Client } from '@web3modal/base/adapters/evm/ethers5'

const ethers5Adapter = new EVMEthers5Client({
  ethersConfig: defaultConfig({
    metadata: ConstantsUtil.Metadata,
    defaultChainId: 1,
    coinbasePreference: 'smartWalletOnly'
  })
})

const modal = createWeb3Modal({
  adapters: [ethers5Adapter],
  caipNetworks: [mainnet, optimism, polygon, zkSync],
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true
  },
  metadata: ConstantsUtil.Metadata,
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
