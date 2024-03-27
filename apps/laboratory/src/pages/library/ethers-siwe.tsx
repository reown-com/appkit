import { SiweData } from '../../components/Siwe/SiweData'
import { EthersTests } from '../../components/Ethers/EthersTests'
import { Web3ModalButtons } from '../../components/Web3ModalButtons'
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { EthersConstants } from '../../utils/EthersConstants'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { siweConfig } from '../../utils/SiweUtils'

const modal = createWeb3Modal({
  ethersConfig: defaultConfig({
    metadata: ConstantsUtil.Metadata,
    defaultChainId: 1,
    rpcUrl: 'https://cloudflare-eth.com'
  }),
  chains: EthersConstants.chains,
  projectId: ConstantsUtil.ProjectId,
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  siweConfig,
  enableOnramp: true,
  customWallets: ConstantsUtil.CustomWallets
})

ThemeStore.setModal(modal)

export default function EthersSiwe() {
  return (
    <>
      <Web3ModalButtons />
      <SiweData />
      <EthersTests />
    </>
  )
}
